import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Send, 
  MessageSquare, 
  HelpCircle,
  CheckCircle,
  AlertCircle,
  Mail
} from "lucide-react";

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 5000);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Get in <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Touch</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Have questions about Homelumina? We're here to help! Reach out to our team and we'll get back to you as soon as possible.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Badge variant="secondary" className="text-sm px-4 py-2">
              <Mail className="w-4 h-4 mr-2" />
              Quick Response
            </Badge>
            <Badge variant="secondary" className="text-sm px-4 py-2">
              <HelpCircle className="w-4 h-4 mr-2" />
              Expert Support
            </Badge>
            <Badge variant="secondary" className="text-sm px-4 py-2">
              <MessageSquare className="w-4 h-4 mr-2" />
              Multiple Channels
            </Badge>
          </div>
        </div>
      </div>

      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <Card className="bg-white dark:bg-gray-800 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center">
                    <Send className="w-6 h-6 mr-3 text-blue-500" />
                    Send us a Message
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {submitStatus === 'success' && (
                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <p className="text-green-700 dark:text-green-300">
                        Thank you! Your message has been sent successfully. We'll get back to you soon.
                      </p>
                    </div>
                  )}

                  {submitStatus === 'error' && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg flex items-center">
                      <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                      <p className="text-red-700 dark:text-red-300">
                        Something went wrong. Please try again or contact us directly.
                      </p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Full Name *
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          className="mt-1"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Email Address *
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          className="mt-1"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="subject" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Subject *
                      </Label>
                      <Input
                        id="subject"
                        name="subject"
                        type="text"
                        required
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="mt-1"
                        placeholder="How can we help you?"
                      />
                    </div>

                    <div>
                      <Label htmlFor="message" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Message *
                      </Label>
                      <Textarea
                        id="message"
                        name="message"
                        required
                        value={formData.message}
                        onChange={handleInputChange}
                        className="mt-1 min-h-[120px]"
                        placeholder="Tell us more about your inquiry..."
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sending...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Send className="w-4 h-4 mr-2" />
                          Send Message
                        </div>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Contact Information
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                  Use the contact form to reach out to our team. We're here to help you with any questions about Homelumina.
                </p>
              </div>

              <div className="space-y-6">
                 <Card className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-gray-700 dark:to-gray-600 border-0">
                   <CardContent className="pt-6">
                     <div className="flex items-start">
                       <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                         <Clock className="w-6 h-6 text-white" />
                       </div>
                       <div>
                         <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                           Business Hours
                         </h3>
                         <p className="text-gray-600 dark:text-gray-300 mb-2">
                           Monday - Friday: 9:00 AM - 6:00 PM EST<br />
                           Saturday: 10:00 AM - 4:00 PM EST<br />
                           Sunday: Closed
                         </p>
                         <p className="text-sm text-gray-500 dark:text-gray-400">
                           Emergency support available 24/7
                         </p>
                       </div>
                     </div>
                   </CardContent>
                 </Card>
               </div>

              {/* FAQ Section */}
              <Card className="bg-white dark:bg-gray-800 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <HelpCircle className="w-5 h-5 mr-3 text-blue-500" />
                    Frequently Asked Questions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      How accurate is the data on Homelumina?
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      We source our data from reliable government databases, real estate platforms, and community surveys. All data is regularly updated and verified for accuracy.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Can I compare multiple locations?
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Yes! Our comparison tool allows you to analyze multiple ZIP codes side-by-side to find the best fit for your needs.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Is Homelumina free to use?
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Yes! Homelumina is completely free to use. All features including search, comparison, analytics, and detailed location insights are available at no cost.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 