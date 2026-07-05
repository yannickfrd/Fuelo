import { getSetting, setSetting } from '@/repositories/settings';

// Variables mock* : autorisées dans jest.mock() malgré le hoisting
const mockSelectGet = jest.fn();
const mockInsertRun = jest.fn();

jest.mock('@/db/client', () => ({
  db: {
    select: () => ({ from: () => ({ where: () => ({ get: mockSelectGet }) }) }),
    insert: () => ({ values: () => ({ onConflictDoUpdate: () => ({ run: mockInsertRun }) }) }),
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── getSetting ──────────────────────────────────────────────────────────────

describe('getSetting', () => {
  it('retourne la valeur si la clé existe', () => {
    mockSelectGet.mockReturnValue({ key: 'theme-preference', value: 'dark' });
    expect(getSetting('theme-preference')).toBe('dark');
  });

  it("retourne null si la clé n'existe pas", () => {
    mockSelectGet.mockReturnValue(undefined);
    expect(getSetting('inexistant')).toBeNull();
  });

  it('retourne null si get() retourne null (ligne inexistante)', () => {
    mockSelectGet.mockReturnValue(null);
    expect(getSetting('foo')).toBeNull();
  });

  it('retourne une chaîne vide si la valeur stockée est vide', () => {
    mockSelectGet.mockReturnValue({ key: 'foo', value: '' });
    expect(getSetting('foo')).toBe('');
  });

  it('retourne null pour une clé vide absente', () => {
    mockSelectGet.mockReturnValue(undefined);
    expect(getSetting('')).toBeNull();
  });
});

// ─── setSetting ──────────────────────────────────────────────────────────────

describe('setSetting', () => {
  it("exécute la requête d'insertion (run appelé)", () => {
    setSetting('theme-preference', 'light');
    expect(mockInsertRun).toHaveBeenCalledTimes(1);
  });

  it('peut stocker une valeur vide sans erreur', () => {
    setSetting('foo', '');
    expect(mockInsertRun).toHaveBeenCalledTimes(1);
  });

  it('peut stocker une clé vide sans erreur', () => {
    setSetting('', 'value');
    expect(mockInsertRun).toHaveBeenCalledTimes(1);
  });

  it("n'appelle pas getSetting lors d'un set (pas de lecture préalable)", () => {
    setSetting('theme-preference', 'dark');
    expect(mockSelectGet).not.toHaveBeenCalled();
  });
});
