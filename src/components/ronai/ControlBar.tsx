
import { Button } from '@/components/ui/button';
import { RonLogoIcon } from './icons/RonLogoIcon';

export function ControlBar() {
  return (
    <div className="h-16 bg-background border-t border-border flex items-center justify-between px-6 fixed bottom-0 left-0 right-0 z-50 shadow-md">
      <div className="flex items-center gap-2">
        <RonLogoIcon className="h-8 w-8" />
        <span className="font-semibold text-lg text-foreground">Ron AI</span>
      </div>
      <Button variant="default" className="bg-primary hover:bg-primary/90 text-primary-foreground">
        Take over
      </Button>
    </div>
  );
}
