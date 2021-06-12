import MessageFeed from '../src/components/MessageFeed';
import { SendMessage, SendMessageProps } from '../src/components/SendMessage';
import { Typography, Row, Col } from 'antd';
import { MessageRequest } from 'baobab-common';
import axios from 'axios';

import styles from '../styles/Message.module.css';

/**
 * Renders the feed page.
 */
export default function Feed(): JSX.Element {
  // declare variables for pagination
  let i = 0;
  const c = 5;

  /**
   * Returns a list of message list props to feed into the MessageList component
   * @returns Message list props.
   */
  const getMessages = async () => {
    // TODO: Make start = c * i to make it more efficient
    const res = await axios.post('/api/message/pagination', {
      start: 0,
      end: c * (i + 1),
    });
    const newMessages = res.data;
    if (newMessages.length !== 0) {
      i++;
    }
    return newMessages;
  };

  /**
   * Sends a message from the signed in user.
   * @param content The contents of the message as a string.
   */
  const sendMessage = async (content: string): Promise<void> => {
    const mr: MessageRequest = { content: content, parentID: -1 };
    await axios.post('/api/message/create', mr);
  };

  return (
    <div className={styles.feed}>
      <Row justify="center" align="middle">
        <Col flex="auto" span={16}>
          <Typography>
            <h2>Feed</h2>
          </Typography>
          <SendMessage author={'You!'} sendMessage={sendMessage} />
          <MessageFeed onLoad={getMessages} initMessages={[]} />
        </Col>
      </Row>
    </div>
  );
}
