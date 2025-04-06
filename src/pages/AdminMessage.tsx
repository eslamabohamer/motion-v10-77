
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Inbox, Check, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  read: boolean;
}

const AdminMessage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching messages:', error);
        toast.error('Failed to load messages');
        return;
      }
      
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleReadStatus = async (id: string, currentReadStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: !currentReadStatus })
        .eq('id', id);
        
      if (error) {
        console.error('Error updating message:', error);
        toast.error('Failed to update message status');
        return;
      }
      
      // Update local state
      setMessages(messages.map(msg => 
        msg.id === id ? { ...msg, read: !currentReadStatus } : msg
      ));
      
      toast.success(`Message marked as ${!currentReadStatus ? 'read' : 'unread'}`);
    } catch (error) {
      console.error('Error updating message:', error);
      toast.error('Failed to update message status');
    }
  };

  return (
    <div className="min-h-screen">
      <main className="pt-8 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center">
                <Inbox className="mr-3 h-8 w-8 text-primary" /> Message Dashboard
              </h1>
              <p className="text-muted-foreground mb-4">
                Manage and respond to all contact form submissions
              </p>
            </div>
            <Button onClick={fetchMessages} className="mt-4 md:mt-0">
              <Check className="mr-2 h-4 w-4" /> Refresh Messages
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-card rounded-lg shadow-xl border overflow-hidden"
            style={{ 
              transformStyle: 'preserve-3d',
              perspective: '1000px'
            }}
          >
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading messages...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="p-12 text-center">
                <Inbox className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">No messages yet</h3>
                <p className="text-muted-foreground">
                  When visitors submit the contact form, their messages will appear here.
                </p>
              </div>
            ) : (
              <Table>
                <TableCaption>A list of your contact form submissions.</TableCaption>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead className="hidden md:table-cell">Message</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead className="w-[100px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((message, index) => (
                    <TableRow 
                      key={message.id}
                      className={!message.read ? "bg-primary/5 font-medium" : ""}
                    >
                      <TableCell>
                        {message.read ? 
                          <Check className="h-5 w-5 text-green-500" /> : 
                          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        }
                      </TableCell>
                      <TableCell className="font-medium">
                        <div>{message.name}</div>
                        <div className="text-xs text-muted-foreground">{message.email}</div>
                      </TableCell>
                      <TableCell>{message.subject}</TableCell>
                      <TableCell className="hidden md:table-cell max-w-xs">
                        <div className="line-clamp-1">{message.message}</div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {format(new Date(message.created_at), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => toggleReadStatus(message.id, message.read)}
                          title={message.read ? "Mark as unread" : "Mark as read"}
                        >
                          {message.read ? 
                            <EyeOff className="h-4 w-4 text-muted-foreground" /> : 
                            <Eye className="h-4 w-4 text-primary" />
                          }
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default AdminMessage;
