/**
 * API Services
 *
 * This module exports all service classes for API communication.
 * Each service is a singleton instance that provides typed methods
 * for interacting with specific backend domains.
 */

export { authService, AuthService } from "./auth.service";
export { restaurantService, RestaurantService } from "./restaurant.service";
export { orderService, OrderService } from "./order.service";
export { paymentService, PaymentService } from "./payment.service";
export { driverService, DriverService } from "./driver.service";
export { adminService, AdminService } from "./admin.service";
export { customerService, CustomerService } from "./customer.service";
