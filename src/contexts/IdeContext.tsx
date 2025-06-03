
"use client";

import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { createContext, useContext, useState, useMemo }
from 'react';

const GFR_CALCULATOR_HTML_DEFAULT = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GFR Calculator - Glomerular Filtration Rate</title>
    <style>
        body { font-family: sans-serif; padding: 20px; background-color: #f0f0f0; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
        .container { background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); width: 100%; max-width: 500px; }
        label { display: block; margin-bottom: 5px; }
        input, select { width: calc(100% - 22px); padding: 10px; margin-bottom: 15px; border: 1px solid #ccc; border-radius: 4px; }
        button { padding: 10px 15px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background-color: #0056b3; }
        #result { margin-top: 20px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <h1>GFR Calculator</h1>
        <div>
            <label for="creatinine">Serum Creatinine (mg/dL):</label>
            <input type="number" id="creatinine" step="0.1" value="1.0">
        </div>
        <div>
            <label for="age">Age (years):</label>
            <input type="number" id="age" value="50">
        </div>
        <div>
            <label for="sex">Sex:</label>
            <select id="sex">
                <option value="male">Male</option>
                <option value="female">Female</option>
            </select>
        </div>
        <button onclick="calculateGFR()">Calculate GFR</button>
        <div id="result"></div>
    </div>
    <script>
        function calculateGFR() {
            const creatinine = parseFloat(document.getElementById('creatinine').value);
            const age = parseInt(document.getElementById('age').value);
            const sex = document.getElementById('sex').value;
            let gfr;
            // Simplified CKD-EPI 2021 for demo
            let k = sex === 'female' ? 0.7 : 0.9;
            let alpha = sex === 'female' ? -0.241 : -0.302;
            let sex_factor = sex === 'female' ? 1.012 : 1;
            gfr = 142 * Math.pow(Math.min(creatinine / k, 1), alpha) * Math.pow(Math.max(creatinine / k, 1), -1.200) * Math.pow(0.9938, age) * sex_factor;
            document.getElementById('result').innerText = 'Estimated GFR: ' + gfr.toFixed(2) + ' mL/min/1.73m²';
        }
    </script>
</body>
</html>
`;


interface IdeContextType {
  ideCode: string;
  setIdeCode: Dispatch<SetStateAction<string>>;
  activeDevelopTab: 'editor' | 'preview' | 'terminal';
  setActiveDevelopTab: Dispatch<SetStateAction<'editor' | 'preview' | 'terminal'>>;
}

const IdeContext = createContext<IdeContextType | undefined>(undefined);

export function IdeProvider({ children }: { children: ReactNode }) {
  const [ideCode, setIdeCode] = useState<string>(GFR_CALCULATOR_HTML_DEFAULT);
  const [activeDevelopTab, setActiveDevelopTab] = useState<'editor' | 'preview' | 'terminal'>('editor');

  const contextValue = useMemo(() => ({
    ideCode,
    setIdeCode,
    activeDevelopTab,
    setActiveDevelopTab,
  }), [ideCode, activeDevelopTab]);

  return (
    <IdeContext.Provider value={contextValue}>
      {children}
    </IdeContext.Provider>
  );
}

export function useIdeContext() {
  const context = useContext(IdeContext);
  if (context === undefined) {
    throw new Error('useIdeContext must be used within an IdeProvider');
  }
  return context;
}
