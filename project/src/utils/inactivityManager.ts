class InactivityManager {
  private timeoutId: NodeJS.Timeout | null = null;
  private warningTimeoutId: NodeJS.Timeout | null = null;
  private warningCallback: (() => void) | null = null;
  private logoutCallback: (() => void) | null = null;
  private isActive = true;
  private readonly INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes
  private readonly WARNING_TIMEOUT = 4 * 60 * 1000; // 4 minutes (1 minute warning)

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, this.resetTimer.bind(this), true);
    });

    // Also track visibility changes
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }

  private handleVisibilityChange() {
    if (document.hidden) {
      this.pause();
    } else {
      this.resume();
    }
  }

  private resetTimer() {
    if (!this.isActive) return;

    this.clearTimeouts();
    this.startWarningTimer();
    this.startLogoutTimer();
  }

  private startWarningTimer() {
    this.warningTimeoutId = setTimeout(() => {
      if (this.warningCallback) {
        this.warningCallback();
      }
    }, this.WARNING_TIMEOUT);
  }

  private startLogoutTimer() {
    this.timeoutId = setTimeout(() => {
      if (this.logoutCallback) {
        this.logoutCallback();
      }
    }, this.INACTIVITY_TIMEOUT);
  }

  private clearTimeouts() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    if (this.warningTimeoutId) {
      clearTimeout(this.warningTimeoutId);
      this.warningTimeoutId = null;
    }
  }

  public start(logoutCallback: () => void) {
    this.logoutCallback = logoutCallback;
    this.isActive = true;
    this.resetTimer();
  }

  public pause() {
    this.isActive = false;
    this.clearTimeouts();
  }

  public resume() {
    this.isActive = true;
    this.resetTimer();
  }

  public stop() {
    this.isActive = false;
    this.clearTimeouts();
  }

  public destroy() {
    this.stop();
    this.logoutCallback = null;
    this.warningCallback = null;
  }

  public onWarning(callback: () => void) {
    this.warningCallback = callback;
  }

  public getRemainingTime(): number {
    if (!this.timeoutId) return 0;
    return this.INACTIVITY_TIMEOUT - (Date.now() - (this.timeoutId as any).startTime);
  }
}

let inactivityManager: InactivityManager | null = null;

export function getInactivityManager(): InactivityManager {
  if (!inactivityManager) {
    inactivityManager = new InactivityManager();
  }
  return inactivityManager;
}