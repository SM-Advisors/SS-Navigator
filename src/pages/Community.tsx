import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { Users, Send, Hash, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useCommunityChannels, useCommunityMessages, useSendMessage } from '@/hooks/useCommunityMessages';
import { useAuth } from '@/contexts/AuthContext';
import { getInitials, formatRelativeTime } from '@/lib/utils';
import { toast } from 'sonner';

export default function Community() {
  const { user } = useAuth();
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: channels, isLoading: loadingChannels } = useCommunityChannels();
  const { data: messages, isLoading: loadingMessages } = useCommunityMessages(activeChannelId);
  const sendMessage = useSendMessage(activeChannelId);

  // Set first default channel on load
  useEffect(() => {
    if (channels?.length && !activeChannelId) {
      const defaultChannel = channels.find(c => c.is_default) ?? channels[0];
      setActiveChannelId(defaultChannel.id);
    }
  }, [channels, activeChannelId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const activeChannel = channels?.find(c => c.id === activeChannelId);

  const handleSend = async () => {
    const content = message.trim();
    if (!content) return;
    try {
      await sendMessage.mutateAsync(content);
      setMessage('');
    } catch {
      toast.error('Failed to send message. Please try again.');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-10rem)] flex gap-4" data-tour="community">
      {/* Channel list */}
      <div className="w-56 shrink-0 flex flex-col border rounded-xl overflow-hidden bg-white">
        <div className="px-3 py-3 border-b">
          <h2 className="font-semibold text-ss-navy text-sm flex items-center gap-2">
            <Users className="h-4 w-4" />
            Community
          </h2>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-0.5">
            {loadingChannels ? (
              <div className="py-4 flex justify-center">
                <LoadingSpinner size="sm" />
              </div>
            ) : (
              channels?.map(channel => (
                <button
                  key={channel.id}
                  onClick={() => setActiveChannelId(channel.id)}
                  className={`w-full text-left px-2 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-1.5 ${
                    activeChannelId === channel.id
                      ? 'bg-ss-navy text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Hash className="h-3 w-3 shrink-0 opacity-60" />
                  <span className="truncate text-xs">{channel.name}</span>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col border rounded-xl overflow-hidden bg-gray-50">
        {/* Channel header */}
        {activeChannel && (
          <div className="px-4 py-3 border-b bg-white flex items-center gap-2">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-semibold text-ss-navy text-sm">{activeChannel.name}</p>
              {activeChannel.description && (
                <p className="text-xs text-muted-foreground">{activeChannel.description}</p>
              )}
            </div>
          </div>
        )}

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          {loadingMessages ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="md" message="Loading messages..." />
            </div>
          ) : !messages?.length ? (
            <div className="text-center py-12">
              <Hash className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No messages yet. Be the first to say hello!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map(msg => {
                const isOwn = msg.user_id === user?.id;
                const displayName = msg.user_profiles?.display_name ?? 'Community Member';
                const role = msg.user_profiles?.role;
                const isNavigator = role === 'navigator' || role === 'admin';

                return (
                  <div key={msg.id} className="flex gap-3">
                    <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                      <AvatarFallback className={`text-xs ${isNavigator ? 'bg-ss-gold text-ss-dark' : 'bg-gray-200 text-gray-700'}`}>
                        {getInitials(displayName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-xs font-semibold ${isOwn ? 'text-ss-navy' : 'text-gray-800'}`}>
                          {isOwn ? 'You' : displayName}
                        </span>
                        {isNavigator && (
                          <Badge className="text-xs h-4 bg-ss-gold text-ss-dark px-1.5 py-0 flex items-center gap-0.5">
                            <Shield className="h-2.5 w-2.5" />
                            Navigator
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(msg.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Message composer */}
        <div className="p-3 border-t bg-white">
          <div className="flex gap-2 items-end">
            <Textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message #${activeChannel?.name ?? 'channel'}...`}
              rows={1}
              className="resize-none min-h-[40px] max-h-28 flex-1 text-sm"
              disabled={!activeChannelId}
            />
            <Button
              onClick={handleSend}
              disabled={!message.trim() || sendMessage.isPending || !activeChannelId}
              size="icon"
              className="bg-ss-navy hover:bg-ss-navy/90 h-10 w-10 shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">
            Be kind and respectful. This is a safe space for families.
          </p>
        </div>
      </div>
    </div>
  );
}
