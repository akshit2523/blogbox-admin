import CommentList from "../components/CommentList";

export default function CommentsPage({ comments, onApprove, onDelete }) {
  return <CommentList comments={comments} onApprove={onApprove} onDelete={onDelete} />;
}
