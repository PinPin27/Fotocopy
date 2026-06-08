export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
};

export type Order = {
  id: string;
  user_id: string;
  customer_name?: string; // provided by join
  status: 'Waiting Payment' | 'Waiting Queue' | 'In Process' | 'Printing' | 'Completed' | 'Cancelled';
  total_price: number;
  queue_number?: number;
  estimated_time?: number;
  document_url: string;
  pages: number;
  color_type: string;
  paper_type: string;
  quantity: number;
  binding_type: string;
  created_at: string;
};

export type Payment = {
  id: string;
  order_id: string;
  method: string;
  status: 'Unpaid' | 'Pending' | 'Paid' | 'Rejected';
  proof_url?: string | null;
  created_at: string;
  document_url: string;
  total_price: number;
  order_status: Order['status'];
  customer_name: string;
  customer_email: string;
};

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: number | boolean;
  created_at: string;
};
