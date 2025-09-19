export interface BrandingConfig {
  storeName: string
  storeAddress: string
  storePhone: string
  logoUrl: string // path under public/, e.g. /logo.png
  orderPrefix: string // for building order numbers
}

const branding: BrandingConfig = {
  storeName: 'Bastet Pets',
  storeAddress: 'اكتب عنوان المحل هنا',
  storePhone: 'اكتب رقم المحل هنا',
  logoUrl: '/logo.ico',
  orderPrefix: 'BP'
}

export default branding
