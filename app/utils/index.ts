export const downloadQrCode = (qrSource: string, filename: string) => {
  const link = document.createElement('a')
  link.href = qrSource
  link.download = filename
  link.click()
}
