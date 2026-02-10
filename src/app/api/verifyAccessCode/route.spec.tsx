import { GET } from './route';

describe('/api/verifyAccessCode', () => {
  describe('GET', () => {
    it('should return 200 and success message when code is valid (1609)', async () => {
      const request = new Request('http://localhost:3000/api/verifyAccessCode?code=1609');
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('application/json');
      expect(data).toEqual({ message: 'Access code is valid' });
    });

    it('should return 401 and error message when code is invalid', async () => {
      const request = new Request('http://localhost:3000/api/verifyAccessCode?code=wrong');
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(401);
      expect(response.headers.get('Content-Type')).toBe('application/json');
      expect(data).toEqual({ message: 'Invalid access code' });
    });

    it('should return 401 when code is empty string', async () => {
      const request = new Request('http://localhost:3000/api/verifyAccessCode?code=');
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(401);
      expect(data).toEqual({ message: 'Invalid access code' });
    });

    it('should return 401 when code parameter is missing', async () => {
      const request = new Request('http://localhost:3000/api/verifyAccessCode');
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(401);
      expect(data).toEqual({ message: 'Invalid access code' });
    });

    it('should return 401 when code is numeric but incorrect', async () => {
      const request = new Request('http://localhost:3000/api/verifyAccessCode?code=1234');
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(401);
      expect(data).toEqual({ message: 'Invalid access code' });
    });

    it('should return 401 when code has correct digits but with extra characters', async () => {
      const request = new Request('http://localhost:3000/api/verifyAccessCode?code=1609extra');
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(401);
      expect(data).toEqual({ message: 'Invalid access code' });
    });

    it('should be case-sensitive for the code', async () => {
      const request = new Request('http://localhost:3000/api/verifyAccessCode?code=1609');
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);
    });
  });
});
