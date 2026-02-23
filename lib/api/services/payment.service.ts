import api from "../../axios";
import type {
  InitiatePaymentRequest,
  InitiatePaymentResponse,
  ConfirmPaymentRequest,
  ConfirmPaymentResponse,
  RefundPaymentRequest,
  RefundPaymentResponse,
} from "../types/payment.types";

export class PaymentService {
  async initiate(
    data: InitiatePaymentRequest,
  ): Promise<InitiatePaymentResponse> {
    const response = await api.post("/payments/initiate", data);
    return response.data;
  }

  async confirm(data: ConfirmPaymentRequest): Promise<ConfirmPaymentResponse> {
    const response = await api.post("/payments/confirm", data);
    return response.data;
  }

  async refund(
    paymentId: string,
    data: RefundPaymentRequest,
  ): Promise<RefundPaymentResponse> {
    const response = await api.post(`/payments/${paymentId}/refund`, data);
    return response.data;
  }
}

export const paymentService = new PaymentService();
