import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { XpProgressBar } from '../gamification/xp-progress-bar';

describe('XpProgressBar', () => {
  const mockProps = {
    level: 5,
    currentXp: 50,
    xpToNextLevel: 100,
    progressPercent: 50,
  };

  it('deve renderizar a barra de XP completa', () => {
    render(<XpProgressBar {...mockProps} />);
    
    expect(screen.getByText('Nível 5')).toBeInTheDocument();
    expect(screen.getByText('50 / 100 XP')).toBeInTheDocument();
    expect(screen.getByText('50% para o próximo nível')).toBeInTheDocument();
  });

  it('deve renderizar a versão compacta', () => {
    render(<XpProgressBar {...mockProps} compact />);
    
    expect(screen.getByText('Nível 5')).toBeInTheDocument();
    expect(screen.getByText('50/100 XP')).toBeInTheDocument();
    expect(screen.queryByText('50% para o próximo nível')).not.toBeInTheDocument();
  });

  it('deve ter largura correta da barra de progresso', () => {
    const { container } = render(<XpProgressBar {...mockProps} />);
    const progressBar = container.querySelector('.h-full.rounded-full');
    
    expect(progressBar).toHaveStyle({ width: '50%' });
  });
});
