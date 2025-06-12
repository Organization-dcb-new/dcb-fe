import { useAuth } from '../provider/AuthProvider'
import { Switch, Space } from 'antd'
import { useLocation } from 'react-router-dom'

const ApiSwitcher = () => {
  const { isDev, toggleApi } = useAuth()
  const location = useLocation()

  const isDisabled = ['/transaction', '/merchant-transaction'].includes(location.pathname)

  return (
    <Space>
      <Switch
        checked={isDev}
        onChange={toggleApi}
        disabled={isDisabled}
        checkedChildren={<span className='text-white mb-1 font-semibold'>Development</span>}
        unCheckedChildren={<span className=' mb-1 font-semibold'>Production</span>}
        className={`${isDev ? 'bg-green-500 border-green-600' : '!bg-[#79B5FF] border-gray-400'}`}
        style={{
          backgroundColor: isDev ? '#22c55e' : '#ffffff',
          border: `1px solid ${isDev ? '#16a34a' : '#d1d5db'}`,
          height: '24px',
          fontSize: '18px !important',
          display: 'flex',
          alignItems: 'center',
        }}
      />
    </Space>
  )
}

export default ApiSwitcher
