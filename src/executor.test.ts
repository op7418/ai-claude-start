import { describe, it, expect } from 'vitest';
import { buildSettingsArg } from './executor.js';
import type { Profile } from './types.js';

describe('executor', () => {
  describe('buildSettingsArg', () => {
    const mockProfile: Profile = {
      name: 'test',
      baseUrl: 'https://api.example.com',
      model: 'test-model'
    };

    it('should build settings with ANTHROPIC_AUTH_TOKEN', () => {
      const settings = buildSettingsArg(mockProfile, 'my-secret-token');
      const parsed = JSON.parse(settings);

      expect(parsed).toHaveProperty('env');
      expect(parsed.env).toHaveProperty('ANTHROPIC_AUTH_TOKEN', 'my-secret-token');
      expect(parsed.env).toHaveProperty('ANTHROPIC_BASE_URL', 'https://api.example.com');
    });

    it('should set ANTHROPIC_BASE_URL for non-default base URLs', () => {
      const settings = buildSettingsArg(mockProfile, 'test-token');
      const parsed = JSON.parse(settings);

      expect(parsed.env).toHaveProperty('ANTHROPIC_BASE_URL', 'https://api.example.com');
      expect(parsed.env).toHaveProperty('ANTHROPIC_AUTH_TOKEN', 'test-token');
    });

    it('should not set ANTHROPIC_BASE_URL for default Anthropic URL', () => {
      const anthropicProfile: Profile = {
        name: 'anthropic',
        baseUrl: 'https://api.anthropic.com'
      };

      const settings = buildSettingsArg(anthropicProfile, 'test-token');
      const parsed = JSON.parse(settings);

      expect(parsed.env).not.toHaveProperty('ANTHROPIC_BASE_URL');
      expect(parsed.env).toHaveProperty('ANTHROPIC_AUTH_TOKEN', 'test-token');
    });

    it('should handle Moonshot profile correctly', () => {
      const moonshotProfile: Profile = {
        name: 'moonshot',
        baseUrl: 'https://api.moonshot.cn/anthropic'
      };

      const settings = buildSettingsArg(moonshotProfile, 'moonshot-token-123');
      const parsed = JSON.parse(settings);

      expect(parsed.env).toHaveProperty('ANTHROPIC_AUTH_TOKEN', 'moonshot-token-123');
      expect(parsed.env).toHaveProperty('ANTHROPIC_BASE_URL', 'https://api.moonshot.cn/anthropic');
    });

    it('should handle BigModel profile correctly', () => {
      const bigmodelProfile: Profile = {
        name: 'bigmodel',
        baseUrl: 'https://open.bigmodel.cn/api/anthropic'
      };

      const settings = buildSettingsArg(bigmodelProfile, 'bigmodel-token-456');
      const parsed = JSON.parse(settings);

      expect(parsed.env).toHaveProperty('ANTHROPIC_AUTH_TOKEN', 'bigmodel-token-456');
      expect(parsed.env).toHaveProperty('ANTHROPIC_BASE_URL', 'https://open.bigmodel.cn/api/anthropic');
    });

    it('should return valid JSON string', () => {
      const settings = buildSettingsArg(mockProfile, 'test-token');

      // Should not throw
      expect(() => JSON.parse(settings)).not.toThrow();
    });
  });
});
