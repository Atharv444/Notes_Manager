/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, Trash2, Star, Clock, StickyNote, Folder, 
  Archive, Trash, ChevronDown, Menu, User, Edit2, LayoutGrid, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Note {
  id: string;
  title: string;
  body: string;
  important: boolean;
  createdAt: string;
  folder: string;
  status: 'active' | 'archived' | 'trash';
}

type ViewType = 'all' | 'recent' | 'folders' | 'archive' | 'trash';

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [folder, setFolder] = useState('General');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('all');
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFolderFilter, setSelectedFolderFilter] = useState<string | null>(null);

  // Manual folder overrides (for empty folders)
  const [explicitFolders, setExplicitFolders] = useState<string[]>(['General', 'Work', 'Personal']);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await fetch('/api/notes');
      const data = await res.json();
      setNotes(data);
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const addNote = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, important: false, folder: selectedFolderFilter || folder }),
      });
      const newNote = await res.json();
      setNotes([newNote, ...notes]);
      setTitle('');
      setBody('');
      setFolder('General');
      setIsAdding(false);
    } catch (err) {
      console.error('Failed to add note:', err);
    }
  };

  const createFolder = () => {
    if (!newFolderName.trim()) return;
    if (!explicitFolders.includes(newFolderName)) {
      setExplicitFolders([...explicitFolders, newFolderName]);
    }
    setNewFolderName('');
    setIsAddingFolder(false);
  };

  const changeStatus = async (id: string, status: 'active' | 'archived' | 'trash', e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const updatedNote = await res.json();
      setNotes(notes.map((n) => (n.id === id ? updatedNote : n)));
    } catch (err) {
      console.error('Failed to change status:', err);
    }
  };

  const deleteNote = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/notes/${id}`, { method: 'DELETE' });
      setNotes(notes.filter((n) => n.id !== id));
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  };

  const toggleImportant = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/notes/${id}`, { method: 'PATCH' });
      const updatedNote = await res.json();
      setNotes(notes.map((n) => (n.id === id ? updatedNote : n)));
    } catch (err) {
      console.error('Failed to toggle importance:', err);
    }
  };

  const filteredNotes = useMemo(() => {
    let result = notes;
    
    // View filtering
    if (currentView === 'recent') {
      result = result.filter(n => n.status === 'active').sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10);
    } else if (currentView === 'archive') {
      result = result.filter(n => n.status === 'archived');
    } else if (currentView === 'trash') {
      result = result.filter(n => n.status === 'trash');
    } else if (currentView === 'all' || currentView === 'folders') {
      result = result.filter(n => n.status === 'active');
    }

    if (selectedFolderFilter) {
      result = result.filter(n => n.folder === selectedFolderFilter);
    }

    return result.filter(
      (note) =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.body.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [notes, searchTerm, currentView, selectedFolderFilter]);

  const allFolders = useMemo(() => {
    const fromNotes = notes.filter(n => n.status === 'active').map(n => n.folder);
    return Array.from(new Set([...explicitFolders, ...fromNotes]));
  }, [notes, explicitFolders]);

  const recentFolders = useMemo(() => {
    const active = notes.filter(n => n.status === 'active').sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const unique = Array.from(new Set(active.map(n => n.folder))).slice(0, 3);
    return unique.length > 0 ? unique : explicitFolders.slice(0, 3);
  }, [notes, explicitFolders]);

  // Design helpers
  const cardColors = ['bg-[#0E1B39]', 'bg-[#1D7D81]', 'bg-[#6B7C93]'];

  return (
    <div className="flex h-screen w-full bg-[#E5E9F0] text-slate-800 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-68 shrink-0 bg-[#102248] text-white flex flex-col p-6 shadow-2xl z-20">
        <div className="mb-10">
          <button 
            onClick={() => setIsAdding(true)}
            className="w-full flex items-center justify-center gap-2 bg-[#1D7D81] hover:bg-[#156266] py-3 rounded-xl font-medium transition-all shadow-lg active:scale-95"
          >
            Add New
          </button>
        </div>

        <nav className="flex-1 space-y-1">
          <NavItem icon={<LayoutGrid className="w-5 h-5" />} label="All Notes" active={currentView === 'all' && !selectedFolderFilter} onClick={() => { setCurrentView('all'); setSelectedFolderFilter(null); }} />
          <NavItem icon={<Clock className="w-5 h-5" />} label="Recent" active={currentView === 'recent'} onClick={() => { setCurrentView('recent'); setSelectedFolderFilter(null); }} />
          <NavItem icon={<Folder className="w-5 h-5" />} label="Folders" hasArrow active={currentView === 'folders'} onClick={() => { setCurrentView('folders'); setSelectedFolderFilter(null); }} />
          <NavItem icon={<Archive className="w-5 h-5" />} label="Archive" active={currentView === 'archive'} onClick={() => { setCurrentView('archive'); setSelectedFolderFilter(null); }} />
          <NavItem icon={<Trash className="w-5 h-5" />} label="Trash" active={currentView === 'trash'} onClick={() => { setCurrentView('trash'); setSelectedFolderFilter(null); }} />
        </nav>

        {/* Upgrade Pro Illustration Placeholder */}
        <div className="mt-auto bg-white/5 rounded-2xl p-4 text-center">
          <div className="w-20 h-20 mx-auto mb-3 bg-[#1D7D81]/20 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-[#1D7D81]" />
          </div>
          <button className="text-xs font-semibold underline decoration-[#1D7D81] underline-offset-4 hover:text-[#1D7D81] transition-colors">
            Upgrade pro
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Navbar */}
        <header className="h-20 shrink-0 flex items-center justify-end px-10 gap-6">
          <div className="flex-1 max-w-sm ml-10">
             <div className="relative group">
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/50 border border-slate-200 rounded-full py-2 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-[#1D7D81]/20 focus:border-[#1D7D81]/50 transition-all text-sm"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#1D7D81] transition-colors" />
             </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-700 font-sans">Atharv</span>
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-200">
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Atharv" 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <button className="p-2 text-slate-500 hover:text-slate-800 transition-colors">
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto px-10 pb-10">
          
          {(currentView === 'all' || currentView === 'recent') && recentFolders.length > 0 && (
            <section className="mb-10">
              <div className="flex items-center justify-between mb-6">
                 <h2 className="text-2xl font-bold text-slate-800">Recent Folders</h2>
                 {selectedFolderFilter && (
                   <button 
                    onClick={() => setSelectedFolderFilter(null)}
                    className="text-xs font-bold text-[#1D7D81] hover:underline"
                   >
                     Show all notes
                   </button>
                 )}
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                {recentFolders.map((f, i) => (
                  <FolderCard 
                    key={f} 
                    color={cardColors[i % cardColors.length]} 
                    title={f} 
                    date="Latest Activity" 
                    onClick={() => { setSelectedFolderFilter(f); setCurrentView('all'); }}
                    active={selectedFolderFilter === f}
                  />
                ))}
                <div 
                  onClick={() => setIsAddingFolder(true)}
                  className="min-w-[140px] aspect-square rounded-[2rem] border-2 border-dashed border-slate-300 flex flex-col items-center justify-center group hover:border-[#1D7D81] transition-colors cursor-pointer"
                >
                  <span className="text-slate-400 text-sm font-medium group-hover:text-[#1D7D81]">New</span>
                  <span className="text-slate-400 text-sm font-medium group-hover:text-[#1D7D81]">folder</span>
                </div>
              </div>
            </section>
          )}

          {currentView === 'folders' && (
             <section className="mb-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800">All Folders</h2>
                {selectedFolderFilter && (
                   <button 
                    onClick={() => setSelectedFolderFilter(null)}
                    className="text-xs font-bold text-[#1D7D81] hover:underline"
                   >
                     Show all
                   </button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {allFolders.map((f, i) => (
                  <FolderCard 
                    key={f} 
                    color={cardColors[i % cardColors.length]} 
                    title={f} 
                    date="Activity" 
                    onClick={() => setSelectedFolderFilter(f)}
                    active={selectedFolderFilter === f}
                  />
                ))}
                <div 
                  onClick={() => setIsAddingFolder(true)}
                  className="aspect-square rounded-[2.5rem] border-2 border-dashed border-slate-300 flex flex-col items-center justify-center group hover:border-[#1D7D81] transition-colors cursor-pointer"
                >
                   <Plus className="w-8 h-8 text-slate-300 group-hover:text-[#1D7D81]" />
                </div>
              </div>
            </section>
          )}

          {/* My Notes Section */}
          {(currentView !== 'folders') && (
            <section>
              <h2 className="text-2xl font-bold text-slate-800 mb-6 capitalize px-1">
                {selectedFolderFilter ? `Notes in ${selectedFolderFilter}` : (currentView === 'all' ? 'My Notes' : `${currentView} Notes`)}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredNotes.map((note, index) => (
                    <motion.div
                      key={note.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className={`${cardColors[index % cardColors.length]} rounded-[2.5rem] p-8 text-white relative h-[320px] shadow-xl flex flex-col transition-transform hover:scale-[1.02] cursor-pointer group`}
                    >
                      <div className="flex justify-between items-start mb-2">
                         <h3 className="text-xl font-bold leading-tight line-clamp-2">{note.title}</h3>
                         <button 
                          onClick={(e) => toggleImportant(note.id, e)}
                          className={`p-1 rounded-full transition-all ${note.important ? 'text-amber-400 scale-110' : 'text-white/20 hover:text-white/60'}`}
                         >
                           <Star className={`w-5 h-5 ${note.important ? 'fill-current' : ''}`} />
                         </button>
                      </div>
                      <p className="text-[10px] text-white/50 font-medium mb-1">
                        {new Date(note.createdAt).toLocaleDateString('en-GB').replace(/\//g, '-')}
                      </p>
                      <span className="text-[9px] bg-white/10 px-2 py-0.5 rounded-full w-fit mb-6 uppercase tracking-widest font-bold">
                        {note.folder}
                      </span>
                      <p className="text-sm text-white/70 leading-relaxed font-light line-clamp-5">
                        {note.body}
                      </p>
                      
                      <div className="mt-auto flex justify-between items-end">
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          {note.status === 'active' && (
                            <>
                              <button 
                                onClick={(e) => changeStatus(note.id, 'archived', e)}
                                title="Archive"
                                className="p-2 text-white/40 hover:text-sky-300 hover:bg-white/10 rounded-lg transition-colors border border-transparent hover:border-white/10"
                              >
                                <Archive className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={(e) => changeStatus(note.id, 'trash', e)}
                                title="Move to Trash"
                                className="p-2 text-white/40 hover:text-red-400 hover:bg-white/10 rounded-lg transition-colors border border-transparent hover:border-white/10"
                              >
                                <Trash className="w-5 h-5" />
                              </button>
                            </>
                          )}
                          {(note.status === 'archived' || note.status === 'trash') && (
                             <button 
                              onClick={(e) => changeStatus(note.id, 'active', e)}
                              title="Restore"
                              className="p-2 text-white/40 hover:text-emerald-400 hover:bg-white/10 rounded-lg transition-colors border border-transparent hover:border-white/10"
                            >
                              <LayoutGrid className="w-5 h-5" />
                            </button>
                          )}
                          {note.status === 'trash' && (
                            <button 
                              onClick={(e) => deleteNote(note.id, e)}
                              title="Delete Permanently"
                              className="p-2 text-white/40 hover:text-red-600 hover:bg-white/10 rounded-lg transition-colors border border-transparent hover:border-white/10"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                        <button className="bg-white/10 hover:bg-white/20 p-2.5 rounded-xl transition-colors border border-white/10">
                          <Edit2 className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}

                  {/* New Note Action Card */}
                  {currentView === 'all' && !selectedFolderFilter && (
                    <motion.div
                      layout
                      onClick={() => setIsAdding(true)}
                      className="min-h-[320px] rounded-[2.5rem] border-2 border-dashed border-slate-300 flex flex-col items-center justify-center group hover:border-[#1D7D81] transition-all cursor-pointer bg-white/20"
                    >
                      <span className="text-slate-400 text-lg font-medium group-hover:text-[#1D7D81] transition-colors">New Note</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {filteredNotes.length === 0 && (
                 <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <StickyNote className="w-16 h-16 mb-4 opacity-20" />
                    <p className="text-lg font-medium">No notes found here</p>
                 </div>
              )}
            </section>
          )}
        </div>

        {/* Add Note Modal */}
        <AnimatePresence>
          {isAdding && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
              onClick={() => setIsAdding(false)}
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-[3rem] w-full max-w-xl p-10 shadow-2xl relative"
                onClick={e => e.stopPropagation()}
              >
                <button 
                  onClick={() => setIsAdding(false)}
                  className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-900 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
                <h2 className="text-3xl font-bold text-slate-900 mb-8">Create New Note</h2>
                <div className="space-y-6">
                  <input
                    type="text"
                    placeholder="Note title"
                    autoFocus
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-xl font-semibold border-b-2 border-slate-100 py-3 focus:outline-none focus:border-[#1D7D81] transition-colors bg-transparent"
                  />
                  <div className="relative">
                    <Folder className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Folder name (e.g. Work, Personal)"
                      value={folder}
                      onChange={(e) => setFolder(e.target.value)}
                      className="w-full pl-6 text-sm font-medium border-b border-slate-100 py-2 focus:outline-none focus:border-[#1D7D81] transition-colors bg-transparent"
                    />
                  </div>
                  <textarea
                    placeholder="Write something amazing..."
                    rows={6}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="w-full text-slate-600 leading-relaxed border-none focus:outline-none bg-transparent resize-none py-3"
                  />
                  <div className="pt-6 flex gap-4">
                    <button
                      onClick={() => { setIsAdding(false); setTitle(''); setBody(''); }}
                      className="flex-1 py-4 border-2 border-slate-100 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 transition-all font-sans"
                    >
                      Discard
                    </button>
                    <button
                      onClick={() => addNote()}
                      disabled={!title.trim() || !body.trim()}
                      className="flex-1 py-4 bg-[#1D7D81] hover:bg-[#156266] text-white rounded-2xl font-bold transition-all disabled:opacity-50 shadow-lg shadow-[#1D7D81]/20 font-sans"
                    >
                      Save Note
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Folder Modal */}
        <AnimatePresence>
          {isAddingFolder && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
               onClick={() => setIsAddingFolder(false)}
            >
              <motion.div 
                 initial={{ scale: 0.9, y: 20 }}
                 animate={{ scale: 1, y: 0 }}
                 exit={{ scale: 0.9, y: 20 }}
                 className="bg-white rounded-[3rem] w-full max-w-sm p-10 shadow-2xl relative"
                 onClick={e => e.stopPropagation()}
              >
                 <h2 className="text-2xl font-bold text-slate-900 mb-6">New Folder</h2>
                 <input
                  type="text"
                  placeholder="Folder name..."
                  autoFocus
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && createFolder()}
                  className="w-full text-lg font-semibold border-b-2 border-slate-100 py-3 focus:outline-none focus:border-[#1D7D81] transition-colors mb-8"
                 />
                 <div className="flex gap-4">
                    <button
                      onClick={() => setIsAddingFolder(false)}
                      className="flex-1 py-3 border border-slate-100 rounded-xl font-bold text-slate-400 hover:bg-slate-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={createFolder}
                      disabled={!newFolderName.trim()}
                      className="flex-1 py-3 bg-[#1D7D81] hover:bg-[#156266] text-white rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg shadow-[#1D7D81]/20 font-sans"
                    >
                      Create
                    </button>
                 </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false, hasArrow = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, hasArrow?: boolean, onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-4 px-4 py-3.5 rounded-xl cursor-pointer transition-all ${active ? 'bg-white/10 text-white shadow-sm' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
    >
      <span className={active ? 'text-[#1D7D81]' : ''}>{icon}</span>
      <span className="font-semibold text-sm flex-1">{label}</span>
      {hasArrow && <ChevronDown className="w-4 h-4 opacity-50" />}
    </div>
  );
}

function FolderCard({ color, title, date, onClick, active }: { color: string, title: string, date: string, onClick?: () => void, active?: boolean, key?: string }) {
  return (
    <div 
      onClick={onClick}
      className={`${color} min-w-[170px] aspect-square rounded-[2.5rem] p-6 text-white shadow-lg flex flex-col justify-between hover:scale-105 transition-transform cursor-pointer relative ${active ? 'ring-4 ring-[#1D7D81]/50 ring-offset-4 ring-offset-[#E5E9F0]' : ''}`}
    >
      <Folder className="w-7 h-7 font-bold" />
      <div>
        <h3 className="font-bold text-sm leading-tight mb-1">{title}</h3>
        <p className="text-[10px] text-white/50 font-medium">{date}</p>
      </div>
    </div>
  );
}

