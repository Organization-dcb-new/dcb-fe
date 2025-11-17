import { useState } from 'react'
import { Input, Button, Card, Typography, Divider, Select, message } from 'antd'
import { useGetApp } from '../hooks/useGetMerchantApp'
import { useCreateTransaction } from '../hooks/useCreateTransaction'
import { useAuth } from '../provider/AuthProvider'
import { formatJSON, highlightJSON, removeEmpty } from '../utils/TransactionUtils'

const { Title } = Typography
const { Option } = Select

export default function TransactionSimulationPage() {
  const [headers, setHeaders] = useState({
    appkey: '',
    appid: '',
    bodysign: '',
    appsecret: '',
  })

  const createTransaction = useCreateTransaction()
  const { data } = useGetApp()
  const { apiUrl } = useAuth()

  const apps = data?.data || []
  const [selectedAppIndex, setSelectedAppIndex] = useState(0)
  const [requestPreview, setRequestPreview] = useState<any>(null)

  const selectedApp = apps[selectedAppIndex] || {}

  const selectedAppKey = selectedApp.app_key || ''
  const selectedAppId = selectedApp.app_id || ''
  const selectedAppSecret = selectedApp.app_secret || ''
  const selectedMethods = selectedApp.payment_method || []

  const [form, setForm] = useState({
    redirect_url: '',
    user_id: '',
    user_mdn: '',
    merchant_transaction_id: '',
    payment_method: '',
    currency: 'IDR',
    amount: 0,
    item_id: '',
    item_name: '',
    notification_url: '',
    redirect_target: '',
  })

  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [apiResponse, setApiResponse] = useState<any>(null)

  const handleFormChange = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setHeaders((prev) => ({ ...prev, bodysign: '' }))
    setGenerated(false)
  }

  const mandatoryFields = ['user_id', 'user_mdn', 'merchant_transaction_id', 'payment_method', 'amount', 'item_name']
  const isMandatoryFilled = mandatoryFields.every(
    (field) => form[field as keyof typeof form] !== '' && form[field as keyof typeof form] !== null,
  )
  const canGenerate = isMandatoryFilled && !generated

  const canSimulate = headers.bodysign && isMandatoryFilled

  const handleGenerate = async () => {
    try {
      setGenerating(true)

      const rawPayload = {
        user_id: form.user_id,
        merchant_transaction_id: form.merchant_transaction_id,
        payment_method: form.payment_method,
        amount: form.amount ? Number(form.amount) : undefined,
        item_name: form.item_name,
      }

      const payload = Object.fromEntries(
        Object.entries(rawPayload).filter(([_, v]) => v !== '' && v !== undefined && v !== null),
      )

      const payloadJson = JSON.stringify(payload)

      const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(selectedAppSecret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign'],
      )

      const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payloadJson))

      let base64 = btoa(String.fromCharCode(...new Uint8Array(signature)))

      const bodysign = base64.replace(/\+/g, '-').replace(/\//g, '_')

      setHeaders((prev) => ({ ...prev, bodysign }))
      setGenerated(true)

      message.success('BodySign generated successfully!')
    } catch (err) {
      message.error('Failed to generate BodySign: ' + err)
    } finally {
      setGenerating(false)
    }
  }

  const handleSimulate = async () => {
    const payload = {
      payment_method: form.payment_method,
      user_id: form.user_id,
      merchant_transaction_id: form.merchant_transaction_id,
      amount: Number(form.amount),
      item_name: form.item_name,
    }
    setRequestPreview({
      headers: {
        appkey: selectedAppKey,
        appid: selectedAppId,
        bodysign: headers.bodysign,
      },
      body: form,
    })

    const result = await createTransaction.mutateAsync({
      apiUrl,
      headers: {
        appkey: selectedAppKey,
        appid: selectedAppId,
        bodysign: headers.bodysign,
      },
      form: payload,
    })

    setApiResponse(result)
    setShowResult(true)
  }

  const paymentOptions = [
    { value: 'telkomsel_airtime', label: 'Telkomsel' },
    { value: 'xl_airtime', label: 'XL' },
    { value: 'three_airtime', label: 'Tri' },
    { value: 'smartfren_airtime', label: 'Smartfren' },
    { value: 'indosat_airtime', label: 'Indosat' },
    { value: 'dana', label: 'Dana' },
    { value: 'ovo', label: 'OVO' },
    { value: 'shopeepay', label: 'ShopeePay' },
    { value: 'qris', label: 'QRIS' },
    { value: 'va_bca', label: 'BCA VA' },
    { value: 'va_bri', label: 'BRI VA' },
    { value: 'va_bni', label: 'BNI VA' },
    { value: 'va_mandiri', label: 'Mandiri VA' },
    { value: 'va_permata', label: 'Permata VA' },
    { value: 'va_sinarmas', label: 'Sinarmas VA' },
    { value: 'alfamart_otc', label: 'Alfamart' },
    { value: 'indomaret_otc', label: 'Indomaret' },
    { value: 'visa_master', label: 'Credit Card' },
  ]

  const currencyOptions = [
    { value: 'IDR', label: 'IDR - Indonesian Rupiah' },
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'PHP', label: 'PHP - Philippine Peso' },
    { value: 'SGD', label: 'SGD - Singapore Dollar' },
    { value: 'MYR', label: 'MYR - Malaysian Ringgit' },
  ]

  const activePayments = paymentOptions.filter((opt) => selectedMethods.includes(opt.value))

  return (
    <div className='min-h-screen flex justify-center items-center bg-gray-50 p-5'>
      <Card className='w-full max-w-6xl shadow-md border border-gray-200 rounded-xl'>
        <div className='text-center mb-6'>
          <Title level={3}>Transaction Simulation</Title>
        </div>

        <div className='mb-6'>
          <Title level={5} className='mb-3 text-blue-600'>
            🔽 Select App
          </Title>

          <Select
            size='large'
            className='w-full'
            value={selectedAppIndex}
            onChange={(val) => {
              setSelectedAppIndex(val)
              setHeaders({
                appkey: apps[val].app_key,
                appid: apps[val].app_id,
                appsecret: apps[val].app_secret,
                bodysign: '',
              })
              setShowResult(false)
              setApiResponse(null)
              setGenerated(false)
              message.info(`Switched to app: ${apps[val].app_name}`)
            }}
          >
            {apps.map((app, idx) => (
              <Option key={idx} value={idx}>
                {app.app_name}
              </Option>
            ))}
          </Select>
        </div>

        {/* Header Section */}
        <div className='mb-6'>
          <Title level={5} className='mb-3 text-blue-600'>
            🔐 Authentication Headers
          </Title>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <label className='text-gray-700 mb-1 font-medium block'>App Key</label>
              <Input value={selectedAppKey} size='large' disabled />
            </div>

            <div>
              <label className='text-gray-700 mb-1 font-medium block'>App ID</label>
              <Input value={selectedAppId} size='large' disabled />
            </div>

            <div>
              <label className='text-gray-700 mb-1 font-medium block'>Body Sign</label>
              <div className='flex gap-2'>
                <Input
                  placeholder='Generated via HMAC SHA-256'
                  value={headers.bodysign}
                  disabled
                  size='large'
                  className='flex-1'
                />
                <Button
                  type='primary'
                  size='large'
                  onClick={handleGenerate}
                  disabled={!canGenerate}
                  loading={generating}
                >
                  {generated ? 'Generated' : 'Generate'}
                </Button>
              </div>
            </div>

            <div>
              <label className='text-gray-700 mb-1 font-medium block'>App Secret</label>
              <Input placeholder='App Secret' value={selectedAppSecret} type='password' disabled={true} size='large' />
            </div>
          </div>
        </div>

        <Divider />

        {/* Transaction Form */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
          {/* redirect_url */}
          <div>
            <label className='text-gray-800 font-semibold text-sm block mb-1'>
              redirect_url <span className='text-gray-500'>(String, Optional)</span>
            </label>
            <Input
              placeholder='https://merchant.com/return'
              value={form.redirect_url}
              onChange={(e) => handleFormChange('redirect_url', e.target.value)}
              size='large'
              className='font-mono'
            />
            <p className='text-gray-500 text-xs mt-1'>URL to redirect user back to merchant page</p>
          </div>

          {/* redirect_target */}
          <div>
            <label className='text-gray-800 font-semibold text-sm block mb-1'>
              redirect_target <span className='text-gray-500'>(String, Optional)</span>
            </label>
            <Input
              placeholder='_top'
              value={form.redirect_target || ''}
              onChange={(e) => handleFormChange('redirect_target', e.target.value)}
              size='large'
              className='font-mono'
            />
            <p className='text-gray-500 text-xs mt-1'>Default is _top</p>
          </div>

          {/* user_id */}
          <div>
            <label className='text-gray-800 font-semibold text-sm block mb-1'>
              user_id <span className='text-red-600 font-medium'>(String, Mandatory)</span>
            </label>
            <Input
              placeholder='Unique user ID (max 50 chars)'
              value={form.user_id}
              onChange={(e) => handleFormChange('user_id', e.target.value)}
              size='large'
              className='font-mono'
            />
            <p className='text-gray-500 text-xs mt-1'>Unique ID for the user (max 50 characters)</p>
          </div>

          {/* user_mdn */}
          <div>
            <label className='text-gray-800 font-semibold text-sm block mb-1'>
              user_mdn <span className='text-red-600 font-medium'>(String, Mandatory)</span>
            </label>
            <Input
              placeholder="User's phone number"
              value={form.user_mdn}
              onChange={(e) => handleFormChange('user_mdn', e.target.value)}
              size='large'
              className='font-mono'
            />
            <p className='text-gray-500 text-xs mt-1'>User's phone number</p>
          </div>

          {/* merchant_transaction_id */}
          <div>
            <label className='text-gray-800 font-semibold text-sm block mb-1'>
              merchant_transaction_id <span className='text-red-600 font-medium'>(String, Mandatory)</span>
            </label>
            <Input
              placeholder='TESTTX000001'
              value={form.merchant_transaction_id}
              onChange={(e) => handleFormChange('merchant_transaction_id', e.target.value)}
              size='large'
              className='font-mono'
            />
            <p className='text-gray-500 text-xs mt-1'>Unique ID for the transaction (max 36 characters)</p>
          </div>

          {/* payment_method */}
          <div>
            <label className='text-gray-800 font-semibold text-sm block mb-1'>
              payment_method <span className='text-red-600 font-medium'>(String, Mandatory)</span>
            </label>
            <Select
              value={form.payment_method || 'Choose Payment Method'}
              onChange={(val) => handleFormChange('payment_method', val)}
              size='large'
              className='w-full font-mono'
            >
              {activePayments.map((opt) => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
              ))}
            </Select>
            <p className='text-gray-500 text-xs mt-1'>Refer to supported payment methods</p>
          </div>

          {/* currency */}
          <div>
            <label className='text-gray-800 font-semibold text-sm block mb-1'>
              currency <span className='text-gray-500'>(String, Optional)</span>
            </label>
            <Select
              value={form.currency || 'IDR'}
              onChange={(val) => handleFormChange('currency', val)}
              size='large'
              className='w-full font-mono'
            >
              {currencyOptions.map((opt) => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
              ))}
            </Select>
            <p className='text-gray-500 text-xs mt-1'>Default is IDR</p>
          </div>

          {/* amount */}
          <div>
            <label className='text-gray-800 font-semibold text-sm block mb-1'>
              amount <span className='text-red-600 font-medium'>(Number, Mandatory)</span>
            </label>
            <Input
              type='number'
              placeholder='e.g. 10000'
              value={form.amount}
              onChange={(e) => handleFormChange('amount', e.target.value)}
              size='large'
              className='font-mono'
            />
            <p className='text-gray-500 text-xs mt-1'>Transaction amount (e.g., 10000)</p>
          </div>

          {/* item_id */}
          <div>
            <label className='text-gray-800 font-semibold text-sm block mb-1'>
              item_id <span className='text-gray-500'>(String, Optional)</span>
            </label>
            <Input
              placeholder='Item identifier'
              value={form.item_id}
              onChange={(e) => handleFormChange('item_id', e.target.value)}
              size='large'
              className='font-mono'
            />
            <p className='text-gray-500 text-xs mt-1'>Item identifier (for fixed denominations)</p>
          </div>

          {/* item_name */}
          <div>
            <label className='text-gray-800 font-semibold text-sm block mb-1'>
              item_name <span className='text-red-600 font-medium'>(String, Mandatory)</span>
            </label>
            <Input
              placeholder='PAYMENT'
              value={form.item_name}
              onChange={(e) => handleFormChange('item_name', e.target.value)}
              size='large'
              className='font-mono'
            />
            <p className='text-gray-500 text-xs mt-1'>Display name for the item (max 25 characters)</p>
          </div>

          {/* notification_url */}
          <div>
            <label className='text-gray-800 font-semibold text-sm block mb-1'>
              notification_url <span className='text-gray-500'>(String, Optional)</span>
            </label>
            <Input
              placeholder='https://merchant.com/callback'
              value={form.notification_url}
              onChange={(e) => handleFormChange('notification_url', e.target.value)}
              size='large'
              className='font-mono'
            />
            <p className='text-gray-500 text-xs mt-1'>URL for callback notification</p>
          </div>
        </div>

        <Button
          type='primary'
          size='large'
          className='mt-6 w-full'
          style={{ borderRadius: 8 }}
          disabled={!canSimulate}
          loading={createTransaction.isPending}
          onClick={handleSimulate}
        >
          Simulate Transaction
        </Button>
        {showResult && (
          <div className='mt-6'>
            <div className='bg-black text-white p-4 rounded-lg mb-4'>
              <div className='flex justify-between items-center mb-2'>
                <Title level={5} style={{ color: 'white' }}>
                  Request Preview
                </Title>

                <Button
                  size='small'
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(removeEmpty(requestPreview), null, 2))
                    message.success('Request copied!')
                  }}
                >
                  Copy
                </Button>
              </div>

              <pre
                className='text-sm leading-relaxed whitespace-pre font-mono'
                dangerouslySetInnerHTML={{
                  __html: requestPreview ? formatJSON(requestPreview) : '',
                }}
              />
            </div>

            <div className='bg-black text-white p-4 rounded-lg'>
              <div className='flex justify-between items-center mb-2'>
                <Title level={5} style={{ color: 'white' }}>
                  Response
                </Title>

                <Button
                  size='small'
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(apiResponse, null, 2))
                    message.success('Response copied!')
                  }}
                >
                  Copy
                </Button>
              </div>

              <pre
                className='text-sm leading-relaxed whitespace-pre font-mono overflow-auto max-h-[400px] p-2'
                dangerouslySetInnerHTML={{
                  __html: apiResponse ? highlightJSON(JSON.stringify(apiResponse, null, 2)) : '',
                }}
              />
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
