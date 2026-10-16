// Every moment of the video, named once from the script (words.json). Nothing else picks a second.
import { line, word } from './timing';

const days = [1, 2, 3, 4, 5].map((n) => line(`اليوم ${n}`));
const facts = ['دماغك يعمل', 'يغفو دماغك', 'تبدأ الهلوسة', 'لا تفرق', 'حالة تشبه'].map((q) => line(q));
const good = line('الخبر الجيد');
const end = line('نم 7');

export const B = {
  q1: line('ماذا يحدث'),
  q2: line('لو بقيت'),
  q2Five: word('لو بقيت', '5'),
  days,
  facts,
  /** When day i's text leaves: just before the next day (or the good news) arrives. */
  dayOut: (i: number) => (i < 4 ? days[i + 1].start : good.start) - 0.4,
  blinks: [word(facts[1], 'يغفو').start, word(facts[1], 'ثواني').start],
  halluc: word(facts[2], 'الهلوسة').start,
  dream: word(facts[3], 'الحلم').start,
  psych: word(facts[4], 'الذهان').start,
  good,
  goodHead: word(good, 'الخبر').start,
  goodBody: word(good, 'النوم').start,
  end,
};
