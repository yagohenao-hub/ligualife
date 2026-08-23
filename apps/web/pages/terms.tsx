import Head from 'next/head'
import styles from '@/styles/Legal.module.css'

export default function Terms() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Términos de Servicio | LinguaLife</title>
      </Head>
      <div className={styles.content}>
        <h1>Términos y Condiciones de Servicio</h1>
        <p>Última actualización: Agosto 2026</p>
        
        <h2>1. Aceptación de los Términos</h2>
        <p>Al acceder y utilizar los servicios de LinguaLife, aceptas cumplir y estar sujeto a estos términos. Si no estás de acuerdo con alguna parte, no podrás utilizar el servicio.</p>

        <h2>2. Prestación del Servicio</h2>
        <p>LinguaLife ofrece clases de inglés guiadas por profesores en vivo, acompañadas de un sistema automatizado de IA por WhatsApp (Pocket Coach). El acceso está condicionado al pago previo de los paquetes de clases.</p>

        <h2>3. Cancelación de Clases y Agendamiento</h2>
        <ul>
          <li><strong>Cancelación:</strong> Toda clase debe ser cancelada o reprogramada con un mínimo de <strong>24 horas de anticipación</strong>. Si cancelas con menos de 24 horas, la clase se descontará de tu paquete automáticamente.</li>
          <li><strong>Asistencia:</strong> El profesor esperará hasta 15 minutos. Si no te presentas en ese margen, la clase se marcará como impartida y será descontada.</li>
        </ul>

        <h2>4. Vigencia de Paquetes</h2>
        <p>Los paquetes de clases tienen una fecha de caducidad según lo especificado al momento de la compra (usualmente 30, 60 o 90 días). Las clases no utilizadas tras la fecha de vencimiento no son reembolsables.</p>

        <h2>5. Responsabilidades del Estudiante</h2>
        <p>El estudiante se compromete a mantener un comportamiento respetuoso con el docente y a no hacer un uso indebido o abusivo del bot automatizado (Pocket Coach).</p>
      </div>
    </div>
  )
}
