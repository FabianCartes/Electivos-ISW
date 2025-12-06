import React from 'react';

export default function AppShell({ title, description, children }) {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-6">
        {title && <h1 className="text-2xl font-bold text-gray-800">{title}</h1>}
        {description && <p className="text-sm text-gray-600">{description}</p>}
      </header>

      <main>{children}</main>
    </div>
  );
}
