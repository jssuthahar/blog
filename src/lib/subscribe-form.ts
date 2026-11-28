/** The topics ticked in a newsletter form (TopicPicker). */
export const pickedTopics = (form: HTMLFormElement): string[] =>
  [...form.querySelectorAll<HTMLInputElement>('input[name="topics"]:checked')].map((i) => i.value);
