export const SUPPORTED_WITHDRAW_METHODS = ['PayPal'];

export function isSupportedWithdrawMethod(method) {
  return SUPPORTED_WITHDRAW_METHODS.includes(method);
}
