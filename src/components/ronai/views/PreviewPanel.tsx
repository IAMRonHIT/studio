
"use client";

import React from 'react';

interface PreviewPanelProps {
  code: string;
}

export function PreviewPanel({ code }: PreviewPanelProps) {
  return (
    <iframe
      srcDoc={code}
      title="Preview"
      className="flex-1 w-full border-0 rounded-md bg-white"
      sandbox="allow-scripts allow-same-origin"
    />
  );
}
