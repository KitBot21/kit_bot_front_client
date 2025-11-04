import { CommentResponseDTO } from "@/components/api/types/APITypes/CommentTypes";
import { useReplies } from "@/components/api/hooks/commentQuery";
import CommentItem from "./CommentItem";
export default function CommentItemWithReplies({
  comment,
  onAdoptAnswer,
  onReplyPress,
}: {
  comment: CommentResponseDTO;
  onAdoptAnswer: (id: string) => void;
  onReplyPress: (authorName: string) => void;
}) {
  const { data: replies = [] } = useReplies(comment.id); // 여기서 Hook 호출

  return (
    <CommentItem
      comment={comment}
      replies={replies}
      onAdoptAnswer={onAdoptAnswer}
      onReplyPress={() => onReplyPress(comment.authorName)}
    />
  );
}
