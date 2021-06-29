import Card from './Card';
import { useState, ChangeEvent } from 'react';
import { Avatar, Form, Input, Comment, Button, Col, Row } from 'antd';
import styles from '../../styles/Post.module.css';
import { PostRequest } from 'baobab-common';
import axios from 'axios';

/**
 * Interface for the SendPost props.
 */
interface SendPostProps extends CreatePostProps {
  /**
   * Function that allows the user to send a post.
   */
  sendPost: (content: string) => Promise<void>;
}

/**
 * Renders a component that allows the user to send a post to the feed.
 */
function SendPost(props: SendPostProps): JSX.Element {
  const [post, setPost] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Updates post based on the post input.
   * @param event Textarea event which has the text contents inside.
   */
  const onPostChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setPost(event.target.value);
  };

  /**
   * Calls the passed in sendPost function.
   */
  const sendPost = async () => {
    setLoading(true);
    await props.sendPost(post);
    setLoading(false);
    setPost('');
  };

  return (
    <Row gutter={[0, 24]}>
      <Col span={24}>
        <Card>
          <Comment
            className={styles.postComment}
            author={props.author}
            avatar={<Avatar />}
            content={
              <Form.Item>
                <Input.TextArea rows={4} onChange={onPostChange} value={post} />
              </Form.Item>
            }
            actions={[
              <Button key="send" type="primary" onClick={sendPost} loading={loading}>
                Send
              </Button>,
            ]}
          />
        </Card>
      </Col>
      <Col span={24} />
    </Row>
  );
}

interface CreatePostProps {
  /**
   * Post sender.
   */
  author: string;
}

const sendPost = async (
  content: string,
  parentPostId: number,
): Promise<void> => {
  const pr: PostRequest = { content: content, parentID: parentPostId };
  await axios.post('/api/post/create', pr);
};

export function CreatePost(props: CreatePostProps): JSX.Element {
  return (
    <SendPost
      author={props.author}
      sendPost={(content) => sendPost(content, -1)}
    />
  );
}

interface ReplyPostProps extends CreatePostProps {
  /**
   * ID of parent post.
   */
  parent: number;
}

export function ReplyPost(props: ReplyPostProps): JSX.Element {
  return (
    <SendPost
      author={props.author}
      sendPost={(content) => sendPost(content, props.parent)}
    />
  );
}
