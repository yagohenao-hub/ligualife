import Head from 'next/head'
import styles from '@/styles/Legal.module.css'

export default function Privacy() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Política de Privacidad | LinguaLife</title>
      </Head>
      <div className={styles.content}>
        <h1>Política de Privacidad y Tratamiento de Datos</h1>
        <p>Última actualización: Agosto 2026</p>
        
        <h2>1. Recopilación de Información</h2>
        <p>Recopilamos información personal (nombre, correo, teléfono, intereses, objetivos de aprendizaje) proporcionada directamente por el usuario al registrarse en LinguaLife, en cumplimiento con la Ley Estatutaria 1581 de 2012 (Ley de Protección de Datos Personales o Hábeas Data en Colombia).</p>

        <h2>2. Uso de la Información y WhatsApp</h2>
        <p>Utilizamos tu número de teléfono para enviar notificaciones de clases, alertas de saldo y proporcionar asistencia pedagógica automatizada mediante nuestro bot interactivo "Pocket Coach" operado a través de WhatsApp (Evolution API). Al registrarte, autorizas el envío de mensajes a tu línea móvil por parte de LinguaLife.</p>

        <h2>3. Procesamiento de Inteligencia Artificial (Gemini)</h2>
        <p>Las interacciones de texto y audio realizadas con el Pocket Coach por WhatsApp son procesadas a través de la API de Google Gemini para evaluar tu progreso, detectar patrones de error ("Filtro Colombiano") y generar ejercicios adaptados a ti. Ninguna información sensible o financiera es enviada a la IA.</p>

        <h2>4. Seguridad y Almacenamiento</h2>
        <p>Los datos curriculares, historiales de clase y saldos son almacenados de forma segura en Airtable y nuestra base de datos PostgreSQL, sin ser compartidos con terceros ajenos a la prestación directa del servicio.</p>

        <h2>5. Tus Derechos (Hábeas Data)</h2>
        <p>Tienes el derecho a conocer, actualizar y rectificar tus datos personales, así como a solicitar la supresión de tu registro de nuestras bases de datos comunicándote con nuestro soporte administrativo.</p>
      </div>
    </div>
  )
}
