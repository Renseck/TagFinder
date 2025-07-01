export function getLogLevelColor(level: string): string {
    switch (level) {
      case 'ERROR': return '#e74c3c';
      case 'WARN': return '#f39c12';
      case 'INFO': return '#3498db';
      case 'DEBUG': return '#95a5a6';
      default: return '#333';
    }
  }

/* ============================================================================================ */
export function getLogLevelIcon(level: string): string {
    switch (level.toUpperCase()) {
      case 'ERROR': return 'error';
      case 'WARN':
      case 'WARNING': return 'warning';
      case 'INFO': return 'info';
      case 'DEBUG': return 'bug_report';
      case 'PROGRESS': return 'trending_up';
      default: return 'circle';
    }
  }