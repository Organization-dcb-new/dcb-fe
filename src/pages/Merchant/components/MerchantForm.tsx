import { Form, Input } from 'antd'

export interface MerchantFormValues {
  merchant_code: string
  secret_key: string
  uid: string
  merchant_name: string
  address: string
  phone: string
  email: string
}

const MerchantForm = () => {
  return (
    <div>
      <div className='flex justify-between gap-4'>
        <Form.Item<MerchantFormValues>
          label='Merchant Code'
          name='merchant_code'
          className='flex-1'
          rules={[{ required: true, message: 'Please input your merchant code!' }]}
        >
          <Input placeholder='Merchant Code' />
        </Form.Item>
        <Form.Item<MerchantFormValues>
          label='Secret Key'
          name='secret_key'
          className='flex-1'
          rules={[{ required: true, message: 'Please input your secret key!' }]}
        >
          <Input placeholder='Secret Key' />
        </Form.Item>
        <Form.Item<MerchantFormValues>
          label='U ID'
          name='uid'
          className='flex-1'
          rules={[{ required: true, message: 'Please input your uid!' }]}
        >
          <Input placeholder='U ID' />
        </Form.Item>
      </div>
      <Form.Item<MerchantFormValues>
        label='Merchant Name'
        name='merchant_name'
        rules={[{ required: true, message: 'Please input your merchant name!' }]}
      >
        <Input placeholder='Merchant Name' />
      </Form.Item>
      <Form.Item<MerchantFormValues>
        label='Address'
        name='address'
        rules={[{ required: true, message: 'Please input your address!' }]}
      >
        <Input placeholder='Address' />
      </Form.Item>
      <Form.Item<MerchantFormValues>
        label='Phone'
        name='phone'
        rules={[{ required: true, message: 'Please input your phone!' }]}
      >
        <Input placeholder='Phone' />
      </Form.Item>
      <Form.Item<MerchantFormValues>
        label='Email'
        name='email'
        rules={[{ required: true, message: 'Please input your email!' }, { type: 'email' }]}
      >
        <Input placeholder='Email' />
      </Form.Item>
    </div>
  )
}

export default MerchantForm
