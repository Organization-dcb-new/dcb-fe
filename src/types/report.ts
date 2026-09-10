export interface ReportSummary {
  merchant_name: string
  payment_method: string
  amount: number
  amount_tax: number
  count: number
  total_amount: number
  share_redision: number
  share_merchant: number
}

export interface ReportData {
  summaries: ReportSummary[]
  additional_fee: number
  bhp_uso: number
  tax_23: number
  service_charge: number
  grand_total_redision: number
  total_merchant: number
  grand_total: number
  total_transaction: number
  total_transaction_amount: number
  share_redision: number
  mdr: string
  share_merchant: number
}
