interface MerchantListDataApi {
  u_id: string
  client_name: string
  client_appkey: string
  client_secret: string
  client_appid: string
  app_name: string
  address: string
  mobile: string
  client_status: number
  phone: string
  email: string
  testing: number
  lang: string
  callback_url: string
  fail_callback: string
  isdcb: string
  updated_at: string
  created_at: string
  payment_methods: {
    id: number
    name: string
    route: string[] | { [key: string]: any[] }
    flexible: boolean
    status: number
    msisdn: number
    client_id: string
  }[]
  settlements: {
    id: number
    client_id: string
    name: string
    is_bhpuso: string
    servicecharge: string
    tax23: string
    ppn: any
    mdr: string
    mdr_type: string
    additionalfee: any
    additional_percent: number
    additionalfee_type: any
    payment_type: string
    share_redision: number
    share_partner: number
    is_divide_1poin1: string
    updated_at: string
    created_at: string
  }[]
  apps: {
    id: number
    app_name: string
    appid: string
    appkey: string
    callback_url: string
    testing: number
    status: number
    mobile: string
    fail_callback: string
    client_id: string
    created_at: string
    updated_at: string
  }[]
  route_weights: {
    id: number
    client_id: string
    payment_method: string
    route: string
    weight: number
    created_at: string
    updated_at: string
  }[]
}
