export interface LogEntry {
  id: string;
  message: string;
  timestamp: string;
  type: "info" | "success" | "warning" | "error" | "proxy";
}

export interface Proxy {
  ip: string;
  port: string;
  username?: string;
  password?: string;
}

export interface StreamInstance {
  id: string;
  url: string;
  assignedIp: string;
  isMuted: boolean;
  status: "active" | "initializing" | "error";
  isLowPower?: boolean;
  mode?: "video" | "shorts";
  alias?: string;
  country?: string;
  browserProfile?: {
    device: string;
    os: string;
    browser: string;
    resolution?: string;
  };
}

export interface EmailMessage {
  id: string;
  from: string;
  subject: string;
  body: string;
  timestamp: string;
  isRead: boolean;
}
