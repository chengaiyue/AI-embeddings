import { NavLink, Outlet } from 'react-router-dom';
import styles from './App.module.css';

export default function App() {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <h1>AI RAG 知识库问答</h1>
        <nav>
          <NavLink to="/chat" className={({ isActive }) => (isActive ? styles.active : '')}>
            AI 对话
          </NavLink>
          <NavLink to="/upload" className={({ isActive }) => (isActive ? styles.active : '')}>
            知识库上传
          </NavLink>
        </nav>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
