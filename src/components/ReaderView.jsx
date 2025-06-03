import { useEffect, useState,useRef } from 'react';
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
  // const [readingStartTime, setReadingStartTime] = useState(null);
  // const [isBookmarked, setIsBookmarked] = useState(false);
  // const [isSaved, setIsSaved] = useState(false);
  const [initialScrollPosition, setInitialScrollPosition] = useState(null); 
  const scrollTimeoutRef = useRef(null); 
  const hasScrolledToPosition = useRef(false); 
  const [showIncompleteDialog, setShowIncompleteDialog] = useState(false); 
  const [pendingScrollPosition, setPendingScrollPosition] = useState(null);

  useEffect(() => {
    // Get messageId from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('messageId');
    
    if (id) {
      setMessageId(id)
      fetchEmailContent(id)
      markMessageAsRead(id)
    } else {
      setError('No message ID provided');
      setLoading(false);
    }
    //prompt the user before unload
    const handleBeforeUnload = (e) => {
      const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
      const scrollPercentage = (scrollPosition / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      
      if (scrollPercentage < 80) {
        // Store scroll position and show custom dialog
        setPendingScrollPosition(scrollPosition);
        setShowIncompleteDialog(true);
        
        // Set a return value to trigger browser's native dialog
        e.preventDefault();
        e.returnValue = ''; // This will show browser's generic "leave page?" dialog
        return '';

        
      }
    };
    //handle page visibility channe when user swicthes/closes tabs
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
        const scrollPercentage = (scrollPosition / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        
        if (scrollPercentage < 80) {
          // Auto-save as incomplete when user leaves without prompt
          saveScrollPosition(id, scrollPosition);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Scroll to saved position after content loads
  useEffect(() => {
    if (emailContent && initialScrollPosition && !hasScrolledToPosition.current) {
      setTimeout(() => {
        window.scrollTo(0, initialScrollPosition);
        hasScrolledToPosition.current = true;
      }, 100);
    }
  }, [emailContent, initialScrollPosition]);

  // handle  dialog actions
  const handleSaveIncomplete = async () => {
    if (pendingScrollPosition !== null) {
      await saveScrollPosition(messageId, pendingScrollPosition);
    }
    setShowIncompleteDialog(false);
    setPendingScrollPosition(null);
  };

  const handleDontSave = async () => {
    await saveScrollPosition(messageId, null);
    setShowIncompleteDialog(false);
    setPendingScrollPosition(null);
  };

const fetchEmailContent = async (id) => {
    try {
      setLoading(true);
      
      // Get newsletter data to check for saved scroll position
      const { newsletters } = await chrome.storage.local.get('newsletters');
      const newsletter = newsletters?.find(nl => nl.id === id);
      if (newsletter?.scrollPosition) {
        setInitialScrollPosition(newsletter.scrollPosition);
      }
      
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

  const markMessageAsRead = async (id) => {
    try {
      await new Promise((resolve) => {
        chrome.runtime.sendMessage(
          { action: 'markAsRead', messageId: id },
          resolve
        );
      });
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  };

const saveScrollPosition = async (id, position) => {
    try {
      await new Promise((resolve) => {
        chrome.runtime.sendMessage(
          { action: 'saveScrollPosition', messageId: id, scrollPosition: position },
          resolve
        );
      });
    } catch (error) {
      console.error('Failed to save scroll position:', error);
    }
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
      {/*custom incomplete dialog */}
      {showIncompleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Save Reading Progress?</h3>
            <p className="text-gray-600 mb-6">
              You haven't finished reading this newsletter. Would you like to mark it as incomplete so you can continue reading later?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleDontSave}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Don't Save
              </button>
              <button
                onClick={handleSaveIncomplete}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Save Progress
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

