interface MerchantListDataModel {
  uid: string
  clientName: string
  clientAppkey: string
  clientSecret: string
  clientAppid: string
  appName: string
  mobile: string
  clientStatus: number
  phone: string
  email: string
  testing: number
  lang: string
  callbackUrl: string
  failCallback: string
  isdcb: string
  updatedAt: string
  createdAt: string
  paymentMethods: {
    id: number
    name: string
    route: {
      [key: string]: any[]
    }
    flexible: boolean
    status: number
    msisdn: number
    clientId: string
  }[]
  settlements: {
    id: number
    clientId: string
    name: string
    isBhpuso: string
    serviceCharge: string
    tax23: string
    ppn: any
    mdr: string
    mdrType: string
    additionalFee: any
    additionalPercent: number
    additionalFeeType: any
    paymentType: string
    shareRedision: number
    sharePartner: number
    isDivide1poin1: string
    updatedAt: string
    createdAt: string
  }[]
  apps: {
    id: number
    appName: string
    appid: string
    appkey: string
    callbackUrl: string
    testing: number
    status: number
    mobile: string
    failCallback: string
    clientId: string
    createdAt: string
    updatedAt: string
  }[]
}
