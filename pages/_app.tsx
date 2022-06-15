import type { AppProps } from 'next/app'
import 'styles/globals.scss'

// Delete this if runtime JavaScript is needed:
export const config = {
  unstable_runtimeJS: false,
}

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default MyApp
