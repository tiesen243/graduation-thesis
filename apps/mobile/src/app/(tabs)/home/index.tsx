import { Typography } from '@rozumari/ui/components/typography'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

export default function TabsHomeIndexScreen() {
  const { t } = useTranslation()

  return (
    <View className='flex-1 p-4'>
      <Typography variant='h1'>Rozumari</Typography>
      <Typography>{t('title')}</Typography>
    </View>
  )
}
