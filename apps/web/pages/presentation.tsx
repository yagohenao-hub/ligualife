import Head from 'next/head'
import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function PresentationPage() {
  const router = useRouter()

  return (
    <>
      <Head>
        <title>LinguaLife — 3-Month Intensive Acceleration Presentation</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
      </Head>
      <iframe
        src="/presentation.html"
        style={{
          width: '100vw',
          height: '100vh',
          border: 'none',
          display: 'block',
          position: 'fixed',
          inset: 0,
          background: '#090a0f'
        }}
      />
    </>
  )
}
