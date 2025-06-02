import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowLeftIcon, 
  DownloadIcon, 
  ExternalLinkIcon,
  CalendarIcon,
  UserIcon,
  MailIcon
} from 'lucide-react';
import DOMPurify from 'dompurify';

export function ReaderView() {
  const [emailContent, setEmailContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messageId, setMessageId] = useState(null);

  useEffect(() => {
    // Get messageId from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('messageId');
    
    if (id) {
      setMessageId(id);
      fetchEmailContent(id);
    } else {
      setError('No message ID provided');
      setLoading(false);
    }
  }, []);

  const fetchEmailContent = async (id) => {
    try {
      setLoading(true);
      
      // Request email content from background script
      const response = await new Promise((resolve) => {
        chrome.runtime.sendMessage(
          { action: 'getEmailContent', messageId: id },
          resolve
        );
      });

      if (response.success) {
        setEmailContent(response.content);
      } else {
        setError(response.error || 'Failed to fetch email content');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching email content');
    } finally {
      setLoading(false);
    }
  };

  const sanitizeHTML = (html) => {
    if (!html) return '';
    
    // Configure DOMPurify to allow common email HTML elements
    const config = {
      ALLOWED_TAGS: [
        'div', 'span', 'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'a', 'img', 
        'table', 'tr', 'td', 'th', 'tbody', 'thead', 'tfoot', 'ul', 'ol', 'li',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'code',
        'center', 'font', 'small', 'big', 'sub', 'sup'
      ],
      ALLOWED_ATTR: [
        'href', 'src', 'alt', 'title', 'width', 'height', 'style', 'class',
        'target', 'rel', 'border', 'cellpadding', 'cellspacing', 'align',
        'valign', 'bgcolor', 'color', 'size', 'face'
      ],
      ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
    };
    
    return DOMPurify.sanitize(html, config);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const handleDownloadAttachment = (attachment) => {
    // This would require additional API call to get attachment data
    console.log('Download attachment:', attachment);
    // Implementation would involve fetching attachment data from Gmail API
  };

  const handleBackToInbox = () => {
    window.close();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading email content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={handleBackToInbox} variant="outline">
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Inbox
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!emailContent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">No email content available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <Button 
            onClick={handleBackToInbox} 
            variant="ghost" 
            size="sm"
            className="flex items-center"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Inbox
          </Button>
          
          <div className="flex items-center space-x-2">
            {emailContent.attachments?.length > 0 && (
              <Badge variant="secondary">
                {emailContent.attachments.length} attachment{emailContent.attachments.length > 1 ? 's' : ''}
              </Badge>
            )}
            <Button variant="outline" size="sm">
              <ExternalLinkIcon className="w-4 h-4 mr-2" />
              Open in Gmail
            </Button>
          </div>
        </div>
      </div>

      {/* Email Content */}
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader className="border-b">
            <div className="space-y-4">
              {/* Subject */}
              <CardTitle className="text-2xl font-bold">
                {emailContent.headers.subject || 'No Subject'}
              </CardTitle>
              
              {/* Sender and Date */}
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <UserIcon className="w-4 h-4 mr-2" />
                    <span>{emailContent.headers.from || 'Unknown Sender'}</span>
                  </div>
                  {emailContent.headers.to && (
                    <div className="flex items-center">
                      <MailIcon className="w-4 h-4 mr-2" />
                      <span>to {emailContent.headers.to}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  <span>{formatDate(emailContent.headers.date)}</span>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Attachments */}
            {emailContent.attachments?.length > 0 && (
              <div className="p-6 border-b bg-gray-50">
                <h3 className="font-semibold mb-3">Attachments</h3>
                <div className="space-y-2">
                  {emailContent.attachments.map((attachment, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 bg-white rounded border"
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mr-3">
                          <span className="text-xs font-medium text-blue-600">
                            {attachment.filename?.split('.').pop()?.toUpperCase() || 'FILE'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{attachment.filename}</p>
                          <p className="text-sm text-gray-500">
                            {attachment.size ? `${Math.round(attachment.size / 1024)} KB` : 'Unknown size'}
                          </p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDownloadAttachment(attachment)}
                      >
                        <DownloadIcon className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Email Body */}
            <div className="p-6">
              {emailContent.html ? (
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: sanitizeHTML(emailContent.html) 
                  }}
                  style={{
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    lineHeight: '1.6',
                    color: '#374151'
                  }}
                />
              ) : emailContent.text ? (
                <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 leading-relaxed">
                  {emailContent.text}
                </pre>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No content available for this email</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

