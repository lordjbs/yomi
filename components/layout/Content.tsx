import styles from 'styles/layout/Content.module.scss'

const Content: React.FC = ({ children }: { children?: React.ReactNode }) => {
  return <div className={styles.root}>{children}</div>
}

export default Content
