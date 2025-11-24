export interface TreeNodeData {
  id: string;
  label: string;
  description?: string; // Short context for the node
  children?: TreeNodeData[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isLoading?: boolean;
}
