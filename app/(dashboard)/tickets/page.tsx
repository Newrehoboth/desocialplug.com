'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Image as ImageIcon, X, Loader2, ChevronDown, ChevronUp, Clock, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';

interface TicketMessage {
  sender: 'user' | 'admin';
  text: string;
  fileUrl?: string;
  createdAt: string;
}

interface TicketItem {
  id: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved';
  messageCount: number;
  lastMessage: TicketMessage | null;
  createdAt: string;
  updatedAt: string;
}

interface FullTicket extends TicketItem {
  messages: TicketMessage[];
}

export default function UserTicketsPage() {
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Submit Ticket Form State
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [attachment, setAttachment] = useState<string | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Expanded Ticket Details State
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedTicket, setExpandedTicket] = useState<FullTicket | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  // Reply Form State
  const [replyText, setReplyText] = useState('');
  const [replyAttachment, setReplyAttachment] = useState<string | null>(null);
  const [replyAttachmentPreview, setReplyAttachmentPreview] = useState<string | null>(null);
  const [sendingReply, setSendingReply] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/user/tickets');
      const data = await res.json();
      if (data.success) {
        setTickets(data.tickets);
      }
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (expandedTicket) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [expandedTicket?.messages]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      toast.error('Subject and description are required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/user/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subject.trim(),
          text: description.trim(),
          fileUrl: attachment || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Support ticket created successfully!');
        setSubject('');
        setDescription('');
        setAttachment(null);
        setAttachmentPreview(null);
        fetchTickets();
      } else {
        toast.error(data.error || 'Failed to create ticket');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleExpand = async (ticketId: string) => {
    if (expandedId === ticketId) {
      setExpandedId(null);
      setExpandedTicket(null);
      return;
    }

    setExpandedId(ticketId);
    setLoadingDetails(true);
    try {
      const res = await fetch(`/api/user/tickets/${ticketId}`);
      const data = await res.json();
      if (data.success) {
        setExpandedTicket(data.ticket);
      } else {
        toast.error(data.error || 'Failed to load details');
        setExpandedId(null);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load ticket details');
      setExpandedId(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expandedId) return;
    if (!replyText.trim() && !replyAttachment) return;

    setSendingReply(true);
    try {
      const res = await fetch(`/api/user/tickets/${expandedId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: replyText.trim(),
          fileUrl: replyAttachment || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setReplyText('');
        setReplyAttachment(null);
        setReplyAttachmentPreview(null);
        
        // Refresh ticket details
        const detailsRes = await fetch(`/api/user/tickets/${expandedId}`);
        const detailsData = await detailsRes.json();
        if (detailsData.success) {
          setExpandedTicket(detailsData.ticket);
        }
        fetchTickets(); // Refresh list to show last message/update
      } else {
        toast.error(data.error || 'Failed to send reply');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to reply');
    } finally {
      setSendingReply(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'new' | 'reply') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be under 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (type === 'new') {
        setAttachment(base64);
        setAttachmentPreview(base64);
      } else {
        setReplyAttachment(base64);
        setReplyAttachmentPreview(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <span className="bg-red-100 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-full">Open</span>;
      case 'in_progress':
        return <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">In Progress</span>;
      case 'resolved':
        return <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">Resolved</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-full">{status}</span>;
    }
  };

  return (
    <main className="min-h-screen bg-background p-4 sm:p-6 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Help & Support</h1>
        <p className="text-sm text-muted-foreground mt-1">Open support tickets or review chat logs with admin support.</p>
      </div>

      {/* Submit Ticket Form */}
      <section className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-primary" /> Create New Ticket
        </h2>
        <form onSubmit={handleCreateTicket} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Subject</label>
            <input
              type="text"
              placeholder="e.g. Issue with deposits, Account query..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={submitting}
              className="w-full px-4 py-2.5 border-2 border-border bg-background text-foreground rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Description / Message</label>
            <textarea
              rows={4}
              placeholder="Please describe your issue in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting}
              className="w-full px-4 py-2.5 border-2 border-border bg-background text-foreground rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all resize-none"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-3">
              <label className="cursor-pointer border border-border px-4 py-2.5 rounded-xl text-xs font-medium hover:bg-muted text-muted-foreground flex items-center gap-2 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'new')}
                  className="hidden"
                />
                <ImageIcon className="w-4 h-4" /> Add Screenshot
              </label>

              {attachmentPreview && (
                <div className="relative border rounded-lg p-1 bg-background">
                  <img src={attachmentPreview} alt="Preview" className="h-10 w-10 object-cover rounded" />
                  <button
                    type="button"
                    onClick={() => {
                      setAttachment(null);
                      setAttachmentPreview(null);
                    }}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting || !subject.trim() || !description.trim()}
              className="px-6 py-2.5 bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl text-sm font-medium shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                </>
              ) : (
                'Submit Ticket'
              )}
            </button>
          </div>
        </form>
      </section>

      {/* Your Tickets History */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">Your Tickets History</h2>

        {loading ? (
          <div className="bg-card rounded-2xl border border-border p-8 text-center text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading ticket history...
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-8 text-center text-muted-foreground">
            No support tickets submitted yet.
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => {
              const isExpanded = expandedId === ticket.id;
              return (
                <div key={ticket.id} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden transition-all">
                  {/* Header Row */}
                  <div
                    onClick={() => handleToggleExpand(ticket.id)}
                    className="p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-muted/20 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-base sm:text-lg">{ticket.subject}</span>
                        {getStatusBadge(ticket.status)}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5" /> {ticket.messageCount} messages
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Updated {new Date(ticket.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div>
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                    </div>
                  </div>

                  {/* Expanded Chat Log */}
                  {isExpanded && (
                    <div className="border-t border-border bg-muted/10 p-5 space-y-4">
                      {loadingDetails ? (
                        <div className="flex justify-center items-center py-8 text-muted-foreground gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" /> Loading messages...
                        </div>
                      ) : expandedTicket ? (
                        <>
                          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                            {expandedTicket.messages.map((msg, idx) => {
                              const isUser = msg.sender === 'user';
                              return (
                                <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                                  <div className={`max-w-[80%] rounded-xl p-3.5 space-y-1 ${
                                    isUser
                                      ? 'bg-primary text-primary-foreground rounded-tr-none'
                                      : 'bg-card text-foreground rounded-tl-none border border-border shadow-sm'
                                  }`}>
                                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                    {msg.fileUrl && (
                                      <div className="mt-2 rounded overflow-hidden max-w-full">
                                        <img src={msg.fileUrl} alt="Attachment" className="max-h-48 object-contain rounded" />
                                      </div>
                                    )}
                                    <p className={`text-[10px] text-right mt-1 ${isUser ? 'text-primary-foreground/75' : 'text-muted-foreground/75'}`}>
                                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                            <div ref={chatEndRef} />
                          </div>

                          {/* Reply Box */}
                          <div className="border-t border-border pt-4">
                            {expandedTicket.status === 'resolved' ? (
                              <div className="text-center py-3 bg-green-50 text-green-700 rounded-xl text-sm font-semibold border border-green-200">
                                This support ticket has been marked as resolved.
                              </div>
                            ) : (
                              <form onSubmit={handleSendReply} className="space-y-3">
                                {replyAttachmentPreview && (
                                  <div className="relative inline-block border rounded p-1 bg-background">
                                    <img src={replyAttachmentPreview} alt="Attachment Preview" className="h-14 w-14 object-cover rounded" />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setReplyAttachment(null);
                                        setReplyAttachmentPreview(null);
                                      }}
                                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                )}

                                <div className="flex gap-2">
                                  <textarea
                                    rows={2}
                                    placeholder="Type your reply..."
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    disabled={sendingReply}
                                    className="flex-1 px-4 py-2 border-2 border-border bg-background text-foreground rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm resize-none"
                                  />
                                  <div className="flex flex-col gap-2 justify-end">
                                    <label className="cursor-pointer border border-border p-2 rounded-xl text-muted-foreground hover:bg-muted transition-colors flex items-center justify-center">
                                      <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, 'reply')}
                                        disabled={sendingReply}
                                        className="hidden"
                                      />
                                      <ImageIcon className="w-4 h-4" />
                                    </label>
                                    <button
                                      type="submit"
                                      disabled={sendingReply || (!replyText.trim() && !replyAttachment)}
                                      className="p-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-all shadow-sm flex items-center justify-center"
                                    >
                                      {sendingReply ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    </button>
                                  </div>
                                </div>
                              </form>
                            )}
                          </div>
                        </>
                      ) : null}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
