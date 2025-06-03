'use server';
/**
 * @fileOverview Defines the Triage Agent for RonAI Mission Control.
 * This agent acts as the initial point of contact, determines user intent,
 * and either responds directly or delegates to specialized agents.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { codeCompletionAgentPrompt, type AiCodeCompletionOutput } from '@/ai/agents/codeCompletionAgent';
import type { ActiveView } from '@/types';

// GFR Calculator HTML - kept here for the triage agent to use for the demo
const GFR_CALCULATOR_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GFR Calculator - Glomerular Filtration Rate</title>
    <style>
        :root {
            --bg-gradient-start: #f5f7fa;
            --bg-gradient-end: #c3cfe2;
            --container-bg: white;
            --text-primary: #2d3748;
            --text-secondary: #4a5568;
            --text-tertiary: #718096;
            --header-gradient-start: #667eea;
            --header-gradient-end: #764ba2;
            --input-bg: #f7fafc;
            --input-bg-focus: white;
            --input-border: #e2e8f0;
            --shadow-color: rgba(0, 0, 0, 0.1);
            --shadow-color-hover: rgba(0, 0, 0, 0.1);
            --results-bg-start: #f7fafc;
            --results-bg-end: #edf2f7;
            --info-box-bg: white;
            --info-box-shadow: rgba(0, 0, 0, 0.05);
            --disclaimer-bg: #fef3c7;
            --disclaimer-border: #f59e0b;
            --disclaimer-text: #92400e;
        }

        [data-theme="dark"] {
            --bg-gradient-start: #1a202c;
            --bg-gradient-end: #2d3748;
            --container-bg: #2d3748;
            --text-primary: #f7fafc;
            --text-secondary: #e2e8f0;
            --text-tertiary: #cbd5e0;
            --header-gradient-start: #7c3aed;
            --header-gradient-end: #a855f7;
            --input-bg: #374151;
            --input-bg-focus: #4a5568;
            --input-border: #4a5568;
            --shadow-color: rgba(0, 0, 0, 0.5);
            --shadow-color-hover: rgba(0, 0, 0, 0.3);
            --results-bg-start: #374151;
            --results-bg-end: #2d3748;
            --info-box-bg: #374151;
            --info-box-shadow: rgba(0, 0, 0, 0.3);
            --disclaimer-bg: #44403c;
            --disclaimer-border: #f59e0b;
            --disclaimer-text: #fbbf24;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, var(--bg-gradient-start) 0%, var(--bg-gradient-end) 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
            color: var(--text-primary);
            transition: all 0.3s ease;
        }

        .container {
            background: var(--container-bg);
            border-radius: 20px;
            box-shadow: 0 20px 60px var(--shadow-color);
            max-width: 800px;
            width: 100%;
            overflow: hidden;
            animation: fadeIn 0.5s ease-out;
            transition: all 0.3s ease;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .header {
            background: linear-gradient(135deg, var(--header-gradient-start) 0%, var(--header-gradient-end) 100%);
            padding: 40px;
            text-align: center;
            color: white;
            position: relative;
        }

        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            font-weight: 700;
        }

        .header p {
            font-size: 1.1em;
            opacity: 0.9;
        }

        .theme-toggle {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(255, 255, 255, 0.2);
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 50px;
            padding: 8px 16px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s ease;
            color: white;
            font-weight: 600;
        }

        .theme-toggle:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
        }

        .theme-icon {
            width: 20px;
            height: 20px;
            transition: all 0.3s ease;
        }

        .content {
            padding: 40px;
        }

        .form-group {
            margin-bottom: 25px;
            animation: slideIn 0.5s ease-out;
        }

        @keyframes slideIn {
            from { opacity: 0; transform: translateX(-20px); }
            to { opacity: 1; transform: translateX(0); }
        }

        label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: var(--text-secondary);
            font-size: 0.95em;
        }

        input[type="number"],
        select {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid var(--input-border);
            border-radius: 10px;
            font-size: 1em;
            transition: all 0.3s ease;
            background: var(--input-bg);
            color: var(--text-primary);
        }

        input[type="number"]:focus,
        select:focus {
            outline: none;
            border-color: var(--header-gradient-start);
            background: var(--input-bg-focus);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
        }

        .radio-group {
            display: flex;
            gap: 20px;
            margin-top: 10px;
        }

        .radio-option {
            display: flex;
            align-items: center;
            cursor: pointer;
            transition: all 0.2s ease;
            color: var(--text-primary);
        }

        .radio-option:hover {
            transform: translateY(-2px);
        }

        input[type="radio"] {
            width: 20px;
            height: 20px;
            margin-right: 8px;
            cursor: pointer;
            accent-color: var(--header-gradient-start);
        }

        .equation-selector {
            display: flex;
            gap: 10px;
            margin-bottom: 30px;
            flex-wrap: wrap;
        }

        .equation-button {
            flex: 1;
            padding: 12px 20px;
            border: 2px solid var(--input-border);
            background: var(--container-bg);
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 600;
            text-align: center;
            min-width: 150px;
            color: var(--text-primary);
        }

        .equation-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px var(--shadow-color-hover);
        }

        .equation-button.active {
            background: linear-gradient(135deg, var(--header-gradient-start) 0%, var(--header-gradient-end) 100%);
            color: white;
            border-color: transparent;
        }

        .calculate-button {
            width: 100%;
            padding: 16px;
            background: linear-gradient(135deg, var(--header-gradient-start) 0%, var(--header-gradient-end) 100%);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 1.1em;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-top: 30px;
        }

        .calculate-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
        }

        .calculate-button:active {
            transform: translateY(0);
        }

        .results {
            margin-top: 40px;
            padding: 30px;
            background: linear-gradient(135deg, var(--results-bg-start) 0%, var(--results-bg-end) 100%);
            border-radius: 15px;
            display: none;
            animation: fadeIn 0.5s ease-out;
        }

        .results.show {
            display: block;
        }

        .result-value {
            font-size: 3em;
            font-weight: 700;
            color: var(--header-gradient-start);
            text-align: center;
            margin-bottom: 10px;
        }

        .result-unit {
            font-size: 1.2em;
            text-align: center;
            color: var(--text-tertiary);
            margin-bottom: 20px;
        }

        .stage-indicator {
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            text-align: center;
            font-weight: 600;
            transition: all 0.3s ease;
        }

        .stage-1 { background: #c3f0c8; color: #22543d; }
        .stage-2 { background: #bee3f8; color: #2c5282; }
        .stage-3a { background: #fef3c7; color: #92400e; }
        .stage-3b { background: #fed7aa; color: #c05621; }
        .stage-4 { background: #fecaca; color: #991b1b; }
        .stage-5 { background: #e0e7ff; color: #3730a3; }

        [data-theme="dark"] .stage-1 { background: #22543d; color: #c3f0c8; }
        [data-theme="dark"] .stage-2 { background: #2c5282; color: #bee3f8; }
        [data-theme="dark"] .stage-3a { background: #92400e; color: #fef3c7; }
        [data-theme="dark"] .stage-3b { background: #c05621; color: #fed7aa; }
        [data-theme="dark"] .stage-4 { background: #991b1b; color: #fecaca; }
        [data-theme="dark"] .stage-5 { background: #3730a3; color: #e0e7ff; }

        .info-box {
            background: var(--info-box-bg);
            padding: 20px;
            border-radius: 10px;
            margin-top: 20px;
            box-shadow: 0 2px 8px var(--info-box-shadow);
            transition: all 0.3s ease;
        }

        .info-box h3 {
            color: var(--text-secondary);
            margin-bottom: 10px;
        }

        .info-box p {
            color: var(--text-tertiary);
            line-height: 1.6;
        }

        .disclaimer {
            margin-top: 30px;
            padding: 20px;
            background: var(--disclaimer-bg);
            border-radius: 10px;
            border-left: 4px solid var(--disclaimer-border);
            color: var(--disclaimer-text);
            font-size: 0.9em;
            transition: all 0.3s ease;
        }

        @media (max-width: 600px) {
            .header h1 {
                font-size: 2em;
            }
            
            .theme-toggle {
                top: 10px;
                right: 10px;
                padding: 6px 12px;
                font-size: 0.9em;
            }
            
            .equation-selector {
                flex-direction: column;
            }
            
            .equation-button {
                width: 100%;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <button class="theme-toggle" onclick="toggleTheme()">
                <svg class="theme-icon" id="sunIcon" fill="currentColor" viewBox="0 0 20 20" style="display: none;">
                    <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"></path>
                </svg>
                <svg class="theme-icon" id="moonIcon" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
                </svg>
                <span id="themeText">Dark</span>
            </button>
            <h1>GFR Calculator</h1>
            <p>Estimate Glomerular Filtration Rate for Kidney Function Assessment</p>
        </div>
        
        <div class="content">
            <div class="equation-selector">
                <button class="equation-button active" onclick="selectEquation('ckd-epi', event)">CKD-EPI 2021</button>
                <button class="equation-button" onclick="selectEquation('mdrd', event)">MDRD</button>
                <button class="equation-button" onclick="selectEquation('cockcroft', event)">Cockcroft-Gault</button>
            </div>
            
            <form id="gfrForm">
                <div class="form-group">
                    <label for="creatinine">Serum Creatinine</label>
                    <div style="display: flex; gap: 10px;">
                        <input type="number" id="creatinine" step="0.01" required>
                        <select id="creatUnit" style="width: 120px;">
                            <option value="mg/dL">mg/dL</option>
                            <option value="umol/L">μmol/L</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="age">Age (years)</label>
                    <input type="number" id="age" min="18" max="120" required>
                </div>
                
                <div class="form-group">
                    <label>Sex</label>
                    <div class="radio-group">
                        <label class="radio-option">
                            <input type="radio" name="sex" value="male" required>
                            Male
                        </label>
                        <label class="radio-option">
                            <input type="radio" name="sex" value="female" required>
                            Female
                        </label>
                    </div>
                </div>
                
                <div class="form-group" id="weightGroup" style="display: none;">
                    <label for="weight">Weight (kg)</label>
                    <input type="number" id="weight" min="20" max="300" step="0.1">
                </div>
                
                <button type="submit" class="calculate-button">Calculate GFR</button>
            </form>
            
            <div id="results" class="results">
                <div class="result-value" id="gfrValue">--</div>
                <div class="result-unit">mL/min/1.73 m²</div>
                <div class="stage-indicator" id="stageIndicator"></div>
                
                <div class="info-box">
                    <h3>Interpretation</h3>
                    <p id="interpretation"></p>
                </div>
                
                <div class="info-box">
                    <h3>About the Equation</h3>
                    <p id="equationInfo"></p>
                </div>
            </div>
            
            <div class="disclaimer">
                <strong>Important:</strong> This calculator is for educational purposes only. Results should be interpreted by healthcare professionals in the context of clinical findings. The CKD-EPI 2021 equation is race-neutral and recommended for most clinical situations.
            </div>
        </div>
    </div>

    <script>
        let selectedEquation = 'ckd-epi';
        
        function initTheme() {
            const savedTheme = localStorage.getItem('gfr-theme') || 'light';
            document.documentElement.setAttribute('data-theme', savedTheme);
            updateThemeToggle(savedTheme);
        }
        
        function toggleTheme() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('gfr-theme', newTheme);
            updateThemeToggle(newTheme);
        }
        
        function updateThemeToggle(theme) {
            const sunIcon = document.getElementById('sunIcon');
            const moonIcon = document.getElementById('moonIcon');
            const themeText = document.getElementById('themeText');
            
            if (theme === 'dark') {
                sunIcon.style.display = 'block';
                moonIcon.style.display = 'none';
                themeText.textContent = 'Light';
            } else {
                sunIcon.style.display = 'none';
                moonIcon.style.display = 'block';
                themeText.textContent = 'Dark';
            }
        }
        
        function selectEquation(equation, event) {
            selectedEquation = equation;
            document.querySelectorAll('.equation-button').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');
            
            document.getElementById('weightGroup').style.display = 
                equation === 'cockcroft' ? 'block' : 'none';
            
            document.getElementById('results').classList.remove('show');
        }
        
        document.getElementById('gfrForm').addEventListener('submit', function(e) {
            e.preventDefault();
            calculateGFR();
        });
        
        function calculateGFR() {
            let creatinine = parseFloat(document.getElementById('creatinine').value);
            const creatUnit = document.getElementById('creatUnit').value;
            const age = parseInt(document.getElementById('age').value);
            const sex = document.querySelector('input[name="sex"]:checked').value;
            const weight = parseFloat(document.getElementById('weight').value) || 0;
            
            if (creatUnit === 'umol/L') {
                creatinine = creatinine / 88.4;
            }
            
            let gfr = 0;
            let equationInfo = '';
            
            switch(selectedEquation) {
                case 'ckd-epi':
                    gfr = calculateCKDEPI(creatinine, age, sex);
                    equationInfo = 'The CKD-EPI 2021 equation is the recommended standard for estimating GFR. It provides accurate estimates across a wide range of GFR values and is race-neutral.';
                    break;
                case 'mdrd':
                    gfr = calculateMDRD(creatinine, age, sex);
                    equationInfo = 'The MDRD equation was widely used but has been largely replaced by CKD-EPI. It may underestimate GFR at higher levels of kidney function.';
                    break;
                case 'cockcroft':
                    gfr = calculateCockcroftGault(creatinine, age, sex, weight);
                    equationInfo = 'The Cockcroft-Gault equation estimates creatinine clearance rather than GFR. It requires weight and may be less accurate in extremes of body composition.';
                    break;
            }
            
            displayResults(gfr, equationInfo);
        }
        
        function calculateCKDEPI(creatinine, age, sex) {
            let kappa = sex === 'female' ? 0.7 : 0.9;
            let alpha = sex === 'female' ? -0.241 : -0.302;
            let factor = sex === 'female' ? 1.012 : 1.0;
            
            let minCr = Math.min(creatinine / kappa, 1);
            let maxCr = Math.max(creatinine / kappa, 1);
            
            let gfr = 142 * Math.pow(minCr, alpha) * Math.pow(maxCr, -1.200) * 
                      Math.pow(0.9938, age) * factor;
            
            return gfr;
        }
        
        function calculateMDRD(creatinine, age, sex) {
            let factor = sex === 'female' ? 0.742 : 1.0;
            let gfr = 175 * Math.pow(creatinine, -1.154) * Math.pow(age, -0.203) * factor;
            return gfr;
        }
        
        function calculateCockcroftGault(creatinine, age, sex, weight) {
            let factor = sex === 'female' ? 0.85 : 1.0;
            let gfr = ((140 - age) * weight * factor) / (72 * creatinine);
            let bsa = Math.sqrt((weight * (age < 18 ? 180 : 170)) / 3600);
            gfr = gfr * 1.73 / bsa;
            return gfr;
        }
        
        function displayResults(gfr, equationInfo) {
            gfr = Math.round(gfr);
            
            document.getElementById('gfrValue').textContent = gfr;
            document.getElementById('equationInfo').textContent = equationInfo;
            
            let stage, stageClass, interpretation;
            
            if (gfr >= 90) {
                stage = 'Stage 1: Normal or High';
                stageClass = 'stage-1';
                interpretation = 'Kidney function is normal or mildly reduced. No kidney damage is present unless there are other signs such as protein in the urine.';
            } else if (gfr >= 60) {
                stage = 'Stage 2: Mildly Decreased';
                stageClass = 'stage-2';
                interpretation = 'Mild reduction in kidney function. Usually no symptoms are present. Focus on controlling risk factors.';
            } else if (gfr >= 45) {
                stage = 'Stage 3a: Mild to Moderately Decreased';
                stageClass = 'stage-3a';
                interpretation = 'Moderate reduction in kidney function. Regular monitoring and management of complications may be needed.';
            } else if (gfr >= 30) {
                stage = 'Stage 3b: Moderately to Severely Decreased';
                stageClass = 'stage-3b';
                interpretation = 'Moderate to severe reduction in kidney function. Referral to a nephrologist is typically recommended.';
            } else if (gfr >= 15) {
                stage = 'Stage 4: Severely Decreased';
                stageClass = 'stage-4';
                interpretation = 'Severe reduction in kidney function. Preparation for kidney replacement therapy (dialysis or transplant) should begin.';
            } else {
                stage = 'Stage 5: Kidney Failure';
                stageClass = 'stage-5';
                interpretation = 'Kidney failure. Dialysis or kidney transplant is needed to maintain life.';
            }
            
            const stageIndicator = document.getElementById('stageIndicator');
            stageIndicator.textContent = stage;
            stageIndicator.className = 'stage-indicator ' + stageClass;
            
            document.getElementById('interpretation').textContent = interpretation;
            document.getElementById('results').classList.add('show');
            
            document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        
        initTheme();
    </script>
</body>
</html>
`;


const TriageAgentInputSchema = z.object({
  prompt: z.string().describe('The user prompt to analyze.'),
  // Include other relevant context if needed, e.g., currentIdeCode, activeView
});
export type TriageAgentInput = z.infer<typeof TriageAgentInputSchema>;

const TriageAgentOutputSchema = z.object({
  text: z.string().describe("The main textual response for the user."),
  toolSuggestion: z.string().optional().describe("The name of the tool/agent used or suggested (e.g., 'Code Editor Helper', 'GFR Calculator', 'CONVERSATIONAL_RESPONSE')."),
  reasoning: z.string().optional().describe("Supporting details, or the conversational reply if toolSuggestion is CONVERSATIONAL_RESPONSE."),
  generatedCode: z.string().optional().describe("Code generated by a specialist agent, if applicable."),
  inputRequirements: z.string().optional().describe("For tool suggestions, what inputs are needed."),
  outputData: z.string().optional().describe("For tool suggestions, what outputs are provided."),
  previewAction: z.object({
    code: z.string(),
    targetPanel: z.nativeEnum(['browser', 'develop', 'tools']), 
    targetDevelopTab: z.nativeEnum(['editor', 'preview', 'terminal']), 
  }).optional(),
});
export type TriageAgentOutput = z.infer<typeof TriageAgentOutputSchema>;


export async function runTriageAgent(input: TriageAgentInput): Promise<TriageAgentOutput> {
  // GFR Calculator Demo Logic (explicit trigger)
  if (input.prompt.toLowerCase().includes('gfr calculator')) {
    return {
      text: "Okay, I can help you with that! I've prepared a GFR calculator.\n\nI'll load it into your Develop panel when you're ready to preview. Here's a summary of what it expects and what it provides:",
      toolSuggestion: "GFR Calculator",
      reasoning: "Generates an interactive GFR calculator. Click 'Generate Preview' to see it in the Develop panel.",
      inputRequirements: `Input:\n- Serum Creatinine (Number, mg/dL or µmol/L)\n- Age (Number, years, >=18)\n- Sex (String: 'male' or 'female')\n- Weight (Number, kg, optional for Cockcroft-Gault)`,
      outputData: `Output:\n- GFR Value (Number, mL/min/1.73 m²)\n- CKD Stage (String)\n- Interpretation (String)`,
      previewAction: {
        code: GFR_CALCULATOR_HTML,
        targetPanel: 'develop',
        targetDevelopTab: 'preview',
      }
    };
  }
  
  // Call the main triage agent prompt
  const { output } = await triageAgentPrompt(input);
  if (!output) {
    return {
      text: "Sorry, I encountered an issue processing your request.",
      toolSuggestion: "ERROR",
    };
  }
  return output;
}

const triageAgentPrompt = ai.definePrompt({
  name: 'triageAgentPrompt',
  input: { schema: TriageAgentInputSchema },
  output: { schema: TriageAgentOutputSchema },
  tools: [codeCompletionAgentPrompt], // Add other specialist agents here as they are created
  system: `You are an AI assistant for RonAI Mission Control.
Your primary role is to understand the user's request and determine the best course of action.
Available specialist agents:
- "codeCompletionAgent": Use this if the user asks for help writing, completing, generating, or explaining code (e.g., JavaScript, HTML, Python, functions, components).

Decision Process:
1.  **Analyze User Prompt**: Understand the user's intent based on their prompt: {{{prompt}}}.
2.  **GFR Calculator Demo**: If the user explicitly asks for a "GFR calculator" or "tool to calculate glomerular filtration rate", respond with the predefined GFR calculator details including input/output requirements and the previewAction. Set toolSuggestion to "GFR Calculator".
3.  **Delegate to Specialist Agent (Code Completion)**: If the user's prompt clearly matches the capabilities of the "codeCompletionAgent", invoke it.
    - On successful completion, set 'toolSuggestion' to "Code Editor Helper".
    - Set 'text' to a user-friendly message like "Okay, I've put together some code... You can see what it does in the 'Preview' tab...".
    - Populate 'generatedCode' with the 'completedCode' from the codeCompletionAgent.
    - Do NOT populate 'previewAction' in this case; the code goes to the editor, and the frontend will switch to preview.
4.  **Conversational Response**: If the prompt is purely conversational (e.g., discussing a patient case, asking a general question not related to a specific tool's function, making a statement, or general chat) or if no specific tool/agent is a clear fit:
    - Set 'toolSuggestion' to "CONVERSATIONAL_RESPONSE".
    - Set 'text' to your direct, helpful, and conversational reply to the user's prompt.
    - The 'reasoning' field can be used for this conversational reply if 'text' needs to be more concise for the UI.
5.  **Other Tool Suggestions (Future)**: For other tools (like Image Generator, Form Generator) that don't have direct specialist agents integrated yet, you can suggest them by setting 'toolSuggestion' to the tool name and providing a 'reasoning' and 'text' explaining its purpose. Do not try to generate code or preview for these yet.

Ensure your response strictly follows the output schema.
Provide user-friendly text.
If providing code, ensure the accompanying text directs the user to the 'Preview' tab.
`,
});
