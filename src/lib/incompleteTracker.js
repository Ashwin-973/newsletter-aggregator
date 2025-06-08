//future compliant
export class IncompleteTracker {
  constructor(messageId) {
    this.messageId = messageId;
    this.startTime = Date.now();
    this.scrollEvents = [];
    this.readingTime = 0;
    this.maxScroll = 0;
  }

  trackScroll(scrollPosition, documentHeight) {
    this.maxScroll = Math.max(this.maxScroll, scrollPosition);
    this.scrollEvents.push({
      position: scrollPosition,
      timestamp: Date.now(),
      percentage: (scrollPosition / documentHeight) * 100
    });
  }

  trackReadingTime() {
    this.readingTime = Date.now() - this.startTime;
  }

  getReadingStats() {
    const scrollPercentage = this.scrollEvents.length > 0 
      ? Math.max(...this.scrollEvents.map(e => e.percentage))
      : 0;

    return {
      scrollPercentage,
      readingTime: this.readingTime,
      maxScroll: this.maxScroll,
      isIncomplete: scrollPercentage < 80,
      estimatedTimeToComplete: this.estimateTimeToComplete(scrollPercentage)
    };
  }

  estimateTimeToComplete(currentPercentage) {
    if (currentPercentage >= 80) return 0;
    
    const avgReadingSpeed = this.readingTime / currentPercentage; // ms per %
    const remainingPercentage = 100 - currentPercentage;
    return Math.round((avgReadingSpeed * remainingPercentage) / 1000); // seconds
  }
}