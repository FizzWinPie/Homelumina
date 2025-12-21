export function GradientWrapper({ children, isDarkMode = false }: { children: React.ReactNode, isDarkMode?: boolean }) {
    return (
        <div className={`min-h-screen relative overflow-hidden transition-colors duration-500 ${
            isDarkMode 
              ? 'bg-gradient-to-br from-gray-900 via-gray-800 via-slate-800 via-purple-900 to-gray-900' 
              : 'bg-gradient-to-br from-slate-100 via-blue-100 via-indigo-100 via-purple-100 to-pink-100'
          }`}>
            {/* Background Pattern Overlay */}
            <div className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${
              isDarkMode 
                ? 'bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)]' 
                : 'bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]'
            }`}></div>
            <div className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${
              isDarkMode 
                ? 'bg-[radial-gradient(circle_at_80%_20%,rgba(147,51,234,0.05),transparent_50%)]' 
                : 'bg-[radial-gradient(circle_at_80%_20%,rgba(147,51,234,0.1),transparent_50%)]'
            }`}></div>
            <div className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${
              isDarkMode 
                ? 'bg-[radial-gradient(circle_at_20%_80%,rgba(236,72,153,0.05),transparent_50%)]' 
                : 'bg-[radial-gradient(circle_at_20%_80%,rgba(236,72,153,0.1),transparent_50%)]'
            }`}></div> 
            {children}
        </div>
    )
}