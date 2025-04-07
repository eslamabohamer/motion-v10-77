import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Mail, User, MessageSquare, Send, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  subject: z.string().min(5, { message: 'Subject must be at least 5 characters' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters' }),
});

type FormValues = z.infer<typeof formSchema>;

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      console.log('Submitting message:', data);
      
      // Insert message into the database
      const { data: insertData, error } = await supabase
        .from('messages')
        .insert([
          {
            name: data.name,
            email: data.email,
            subject: data.subject,
            message: data.message,
            read: false
          }
        ])
        .select();
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Message sent successfully:', insertData);
      
      // Send email notifications if message was saved to database
      if (insertData && insertData.length > 0) {
        try {
          const messageData = {
            id: insertData[0].id,
            name: data.name,
            email: data.email,
            subject: data.subject,
            message: data.message
          };
          
          const response = await fetch('https://tyczqgeyhjxwfyjgwmio.supabase.co/functions/v1/send-contact-notification', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabase.auth.session()?.access_token || ''}`,
            },
            body: JSON.stringify(messageData),
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error('Email notification error:', errorData);
          } else {
            console.log('Email notifications sent successfully');
          }
        } catch (emailError) {
          console.error('Failed to send email notifications:', emailError);
          // Continue with form success even if email fails
        }
      }
      
      setIsSuccess(true);
      form.reset();
      
      toast.success("Message sent!", {
        description: "Thank you for reaching out. I'll get back to you soon."
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error("Something went wrong", {
        description: "Your message couldn't be sent. Please try again later."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1F2C] text-white">
      <Navbar />
      <main className="pt-28 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[#4a6cf7] to-[#9b87f5] bg-clip-text text-transparent">Get in Touch</h1>
            <p className="text-white/70 mb-8">
              Have a project in mind? Fill out the form below, and I'll get back to you as soon as possible to discuss how we can work together.
            </p>
            
            <div className="border border-white/10 rounded-lg p-6 bg-white/5 backdrop-blur-sm shadow-lg">
              {isSuccess ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-16 w-16 text-[#4a6cf7] mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Message Sent!</h2>
                  <p className="mb-6 text-white/70">
                    Thank you for reaching out. I'll get back to you as soon as possible.
                  </p>
                  <Button onClick={() => setIsSuccess(false)} className="bg-[#4a6cf7] hover:bg-[#3a5ce7]">
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Name</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                                <Input placeholder="Your name" className="pl-10 bg-white/5 border-white/10 text-white" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Email</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                                <Input type="email" placeholder="Your email" className="pl-10 bg-white/5 border-white/10 text-white" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Subject</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                              <Input placeholder="What's this about?" className="pl-10 bg-white/5 border-white/10 text-white" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Message</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell me about your project..."
                              className="min-h-[150px] bg-white/5 border-white/10 text-white resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-[#4a6cf7] hover:bg-[#3a5ce7] py-6 h-auto text-base" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <Send className="mr-2 h-4 w-4" /> Send Message
                        </span>
                      )}
                    </Button>
                  </form>
                </Form>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
