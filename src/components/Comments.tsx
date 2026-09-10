"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/Cards";
import { useToast } from "@/components/Toast";
import { formatRelativeDate } from "@/lib/utils";

type CommentNode = {
  id: string;
  content: string;
  createdAt: string;
  likesCount: number;
  user: { name: string; username: string; avatar: string | null };
  replies?: CommentNode[];
};

export function Comments({
  videoId,
  initial,
  loggedIn,
}: {
  videoId: string;
  initial: CommentNode[];
  loggedIn: boolean;
}) {
  const [items, setItems] = useState(initial);
  const [text, setText] = useState("");
  const toast = useToast();
  const router = useRouter();

  async function submit(parentId?: string, body?: string) {
    if (!loggedIn) return router.push("/login");
    const content = (body ?? text).trim();
    if (!content) return;
    const res = await fetch(`/api/videos/${videoId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, parentId }),
    });
    if (!res.ok) return toast.push("Could not post comment");
    const comment = await res.json();
    if (parentId) {
      setItems((prev) =>
        prev.map((c) => (c.id === parentId ? { ...c, replies: [...(c.replies ?? []), comment] } : c)),
      );
    } else {
      setItems((prev) => [comment, ...prev]);
      setText("");
    }
  }

  return (
    <section className="mt-10">
      <h2 className="display text-2xl">Comments</h2>
      <form
        className="mt-4 flex gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder={loggedIn ? "Add a comment" : "Log in to comment"}
          className="w-full rounded-2xl border border-line bg-bg-elev p-3 text-sm"
        />
        <button type="submit" className="self-end rounded-full bg-ink px-4 py-2 text-sm text-bg">
          Post
        </button>
      </form>
      <ul className="mt-6 space-y-6">
        {items.map((c) => (
          <li key={c.id}>
            <CommentItem comment={c} onReply={(id, body) => submit(id, body)} videoId={videoId} loggedIn={loggedIn} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function CommentItem({
  comment,
  onReply,
  videoId,
  loggedIn,
}: {
  comment: CommentNode;
  onReply: (id: string, body: string) => void;
  videoId: string;
  loggedIn: boolean;
}) {
  const [reply, setReply] = useState("");
  const [open, setOpen] = useState(false);
  const toast = useToast();

  return (
    <div className="flex gap-3">
      <Avatar name={comment.user.name} src={comment.user.avatar} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="text-sm">
          <span className="font-medium">{comment.user.name}</span>{" "}
          <span className="text-muted">{formatRelativeDate(comment.createdAt)}</span>
        </p>
        <p className="mt-1 text-sm">{comment.content}</p>
        <div className="mt-2 flex gap-3 text-xs text-muted">
          <button type="button" onClick={() => setOpen((v) => !v)}>
            Reply
          </button>
          <button
            type="button"
            onClick={async () => {
              if (!loggedIn) return;
              await fetch(`/api/comments/${comment.id}/like`, { method: "POST" });
            }}
          >
            Like
          </button>
          <button
            type="button"
            onClick={async () => {
              if (!loggedIn) return;
              const res = await fetch("/api/reports", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  targetType: "COMMENT",
                  reason: "SPAM",
                  commentId: comment.id,
                  videoId,
                }),
              });
              toast.push(res.ok ? "Report sent" : "Could not report");
            }}
          >
            Report
          </button>
        </div>
        {open ? (
          <form
            className="mt-2 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              onReply(comment.id, reply);
              setReply("");
              setOpen(false);
            }}
          >
            <input
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              className="flex-1 rounded-full border border-line bg-bg-elev px-3 py-1.5 text-sm"
              placeholder="Write a reply"
            />
            <button className="text-sm" type="submit">
              Send
            </button>
          </form>
        ) : null}
        {comment.replies?.length ? (
          <ul className="mt-4 space-y-4">
            {comment.replies.map((r) => (
              <li key={r.id} className="flex gap-3">
                <Avatar name={r.user.name} src={r.user.avatar} size="sm" />
                <div>
                  <p className="text-sm">
                    <span className="font-medium">{r.user.name}</span>{" "}
                    <span className="text-muted">{formatRelativeDate(r.createdAt)}</span>
                  </p>
                  <p className="mt-1 text-sm">{r.content}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
