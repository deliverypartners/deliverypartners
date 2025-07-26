'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle, Send, MessageSquare } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  issueType: string;
  subject: string;
  message: string;
}

interface SubmissionState {
  isSubmitting: boolean;
  isSubmitted: boolean;
  error: string | null;
}

const issueTypes = [
  { value: 'technical', label: '🔧 Technical Issue' },
  { value: 'billing', label: '💳 Billing & Payment' },
  { value: 'delivery', label: '🚚 Delivery Problem' },
  { value: 'account', label: '👤 Account Issue' },
  { value: 'general', label: '💬 General Inquiry' },
  { value: 'complaint', label: '😠 Complaint' },
  { value: 'feature', label: '💡 Feature Request' }
];

export const ContactForm = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    issueType: '',
    subject: '',
    message: ''
  });

  const [submissionState, setSubmissionState] = useState<SubmissionState>({
    isSubmitting: false,
    isSubmitted: false,
    error: null
  });

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (submissionState.error) {
      setSubmissionState(prev => ({ ...prev, error: null }));
    }
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return 'Name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!formData.issueType) return 'Please select an issue type';
    if (!formData.subject.trim()) return 'Subject is required';
    if (!formData.message.trim()) return 'Message is required';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return 'Please enter a valid email address';
    
    if (formData.message.trim().length < 10) return 'Message must be at least 10 characters long';
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setSubmissionState(prev => ({ ...prev, error: validationError }));
      return;
    }

    setSubmissionState({
      isSubmitting: true,
      isSubmitted: false,
      error: null
    });

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_ELSE_PUBLIC_API_URL;
      const response = await fetch(`${API_URL}/support/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmissionState({
          isSubmitting: false,
          isSubmitted: true,
          error: null
        });
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          issueType: '',
          subject: '',
          message: ''
        });
      } else {
        setSubmissionState({
          isSubmitting: false,
          isSubmitted: false,
          error: result.message || 'Failed to submit your request. Please try again.'
        });
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setSubmissionState({
        isSubmitting: false,
        isSubmitted: false,
        error: 'Network error. Please check your connection and try again.'
      });
    }
  };

  // Show success message if form was submitted successfully
  if (submissionState.isSubmitted) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Message Sent Successfully!</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Thank you for contacting us. Our support team has received your message and will get back to you soon.
            </p>
            <Button 
              onClick={() => setSubmissionState({ isSubmitting: false, isSubmitted: false, error: null })}
              variant="outline"
              className="mt-4"
            >
              Send Another Message
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          <span>Contact Support</span>
        </CardTitle>
        <CardDescription>
          Send us a message and our support team will respond as soon as possible.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Alert */}
          {submissionState.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{submissionState.error}</AlertDescription>
            </Alert>
          )}

          {/* Name and Email Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full"
                disabled={submissionState.isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full"
                disabled={submissionState.isSubmitting}
              />
            </div>
          </div>

          {/* Phone and Issue Type Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone Number (Optional)
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 123 456 7890"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full"
                disabled={submissionState.isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="issueType" className="text-sm font-medium">
                Issue Type <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.issueType}
                onValueChange={(value) => handleInputChange('issueType', value)}
                disabled={submissionState.isSubmitting} 
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select issue type" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {issueTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-sm font-medium">
              Subject <span className="text-red-500">*</span>
            </Label>
            <Input
              id="subject"
              type="text"
              placeholder="Brief description of your issue"
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              className="w-full"
              disabled={submissionState.isSubmitting}
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium">
              Message <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="message"
              placeholder="Please describe your issue in detail..."
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              className="w-full min-h-[120px] resize-y"
              disabled={submissionState.isSubmitting}
            />
            <p className="text-xs text-gray-500">
              Minimum 10 characters. Current: {formData.message.length}
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            disabled={submissionState.isSubmitting}
          >
            {submissionState.isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending Message...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </>
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            We typically respond within 24 hours during business days.
          </p>
        </form>
      </CardContent>
    </Card>
  );
};
