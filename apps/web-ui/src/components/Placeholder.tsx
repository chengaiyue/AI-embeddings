/**
 * 通用占位组件：后续把气泡消息、文件卡片、加载指示等抽到这里。
 */
export default function Placeholder({ text }: { text: string }) {
  return <div style={{ color: '#9ca3af', textAlign: 'center', padding: 24 }}>{text}</div>;
}
