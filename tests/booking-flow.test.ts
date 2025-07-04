import { BookingFlow } from '../src/workflows/booking-flow';
import { BookingRequest } from '../src/types';

test('BookingFlow should be instantiable', () => {
  const bookingFlow = new BookingFlow();
  expect(bookingFlow).toBeDefined();
});

test('BookingRequest interface should have required fields', () => {
  const request: BookingRequest = {
    line_uid: 'test-line-uid',
    event_id: 'test-event-id',
    user_name: 'Test User',
    user_email: 'test@example.com'
  };
  
  expect(request.line_uid).toBe('test-line-uid');
  expect(request.event_id).toBe('test-event-id');
  expect(request.user_name).toBe('Test User');
});
