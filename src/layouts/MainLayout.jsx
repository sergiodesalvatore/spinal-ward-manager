import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

const MainLayout = ({ setIsSettingsOpen }) => {
  const location = useLocation();

  // Helper function to determine if a link is active based on standard matching
  const getLinkClasses = ({ isActive }) => {
    return isActive
      ? "flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 text-[#005dac] rounded-xl shadow-sm font-manrope text-sm font-bold transition-all duration-200"
      : "flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-[#005dac] hover:bg-white/50 dark:hover:bg-slate-700/50 rounded-xl transition-all duration-200 font-manrope text-sm font-medium";
  };

  const getMobileLinkClasses = ({ isActive }) => {
    return isActive
      ? "flex flex-col items-center justify-center bg-[#005dac] text-white rounded-2xl px-5 py-2 active:scale-90 transition-transform duration-300 shadow-sm"
      : "flex flex-col items-center justify-center text-[#414752] dark:text-slate-400 px-5 py-2 hover:bg-[#f2f4f5] dark:hover:bg-slate-800 active:scale-90 transition-transform duration-300 rounded-2xl";
  };

  return (
    <div className="flex min-h-screen bg-background text-on-surface">
      {/* SideNavBar (Desktop Only) */}
      <aside className="hidden md:flex h-screen w-64 fixed left-0 top-0 bg-[#f2f4f5] dark:bg-slate-800 flex-col p-4 space-y-2 border-r border-[#c1c6d4]/15 z-50">
        <div className="mb-8 px-2 mt-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-sm">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>clinical_notes</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-tight font-headline">Unità Operativa Ortopedia</h2>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Reparto Chirurgia Vertebrale</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 space-y-1">
          <NavLink to="/" className={getLinkClasses}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: location.pathname === '/' ? "'FILL' 1" : "" }}>clinical_notes</span>
            <span>Pazienti Attivi</span>
          </NavLink>
          <NavLink to="/add" className={getLinkClasses}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: location.pathname === '/add' ? "'FILL' 1" : "" }}>person_add</span>
            <span>Aggiungi Paziente</span>
          </NavLink>
          <NavLink to="/archive" className={getLinkClasses}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: location.pathname === '/archive' ? "'FILL' 1" : "" }}>archive</span>
            <span>Archivio</span>
          </NavLink>
        </nav>

        <div className="pt-4 border-t border-outline-variant/20 space-y-1">
          <button className="w-full mb-4 py-3 px-4 bg-error-container text-on-error-container rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-transform active:scale-95">
            <span className="material-symbols-outlined text-sm">emergency</span>
            Allarme Emergenza
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-[#005dac] hover:bg-white/50 dark:hover:bg-slate-700/50 rounded-xl transition-all duration-200 font-manrope text-sm font-medium">
            <span className="material-symbols-outlined">help</span>
            <span>Supporto</span>
          </button>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="flex-1 md:ml-64 min-h-screen flex flex-col pb-24 md:pb-0 relative">
        {/* TopAppBar */}
        <header className="flex justify-between items-center w-full px-4 md:px-8 py-3 md:py-4 sticky top-0 z-40 bg-[#f8fafb]/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-outline-variant/10 md:border-none">
          <div className="flex items-center gap-3 md:gap-8">
            <div className="md:hidden w-8 h-8 rounded-full bg-primary-container flex items-center justify-center overflow-hidden shrink-0">
               <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
            </div>
            <span className="text-xl font-bold text-[#005dac] dark:text-blue-400 tracking-tight font-headline">ScolioCare</span>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button className="p-2 text-slate-600 dark:text-slate-400 hover:bg-[#f2f4f5] dark:hover:bg-slate-800 rounded-full transition-colors relative active:scale-90 shrink-0">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-background"></span>
            </button>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-slate-600 dark:text-slate-400 hover:bg-[#f2f4f5] dark:hover:bg-slate-800 rounded-full transition-colors active:scale-90 shrink-0"
              title="ScolioCare Settings"
            >
              <span className="material-symbols-outlined">settings</span>
            </button>
            <div className="hidden md:block h-8 w-[1px] bg-outline-variant/30 mx-2"></div>
            <div className="hidden md:flex items-center gap-3">
              <span className="text-xs font-semibold text-on-surface-variant">Dr. Aris Thorne</span>
              <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant/30 shadow-sm shrink-0">
                 <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAXMyjhSyH-bRvvem3BqfvGx1Vr-8VrSRm36WLvbm6zjtS7A0Cx9igjnBwp7L3hd6g30OPubOCNQzHNz1f2SZ9VlCQ6BM45tSf9AZNn4nL6juI3-rLX56pmBo-JzVikfC7vyCUnuS4mjghl3oAszsDLqnLriR8MBauB9TwDG1IEyUF6gp8XTLYLTqqQ0OVznD_F6V_FyaTnKuZv8C6U4_QuSv7AaVvXWOzCIMyt1q4pCO86NhTGOAQvgzln5-lDhOD7a754D9ED56CV" alt="Profile" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-t-3xl shadow-[0_-8px_24px_rgba(25,28,29,0.06)] border-t border-outline-variant/10">
        <NavLink to="/" className={getMobileLinkClasses}>
          <span className="material-symbols-outlined mb-0.5" style={{ fontVariationSettings: location.pathname === '/' ? "'FILL' 1" : "" }}>personal_injury</span>
          <span className="text-[10px] font-bold font-inter uppercase tracking-widest">Attivi</span>
        </NavLink>
        <NavLink to="/add" className={getMobileLinkClasses}>
          <span className="material-symbols-outlined mb-0.5" style={{ fontVariationSettings: location.pathname === '/add' ? "'FILL' 1" : "" }}>add_circle</span>
          <span className="text-[10px] font-bold font-inter uppercase tracking-widest">Nuovo</span>
        </NavLink>
        <NavLink to="/archive" className={getMobileLinkClasses}>
          <span className="material-symbols-outlined mb-0.5" style={{ fontVariationSettings: location.pathname === '/archive' ? "'FILL' 1" : "" }}>inventory_2</span>
          <span className="text-[10px] font-bold font-inter uppercase tracking-widest">Archivio</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default MainLayout;
