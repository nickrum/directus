<template>
	<v-menu v-model="menuActive" attached>
		<template #activator="{ toggle }">
			<v-input :disabled="disabled">
				<template #input>
					<span ref="contentEl" class="content" :contenteditable="!disabled" @keydown="onKeyDown" @input="onInput">
						<template v-for="(element, i) of localValue">
							<span
								v-if="element.type === 'text' || element.type === 'empty'"
								:key="`text-${i}`"
								:class="element.type"
								:data-index="i"
							>
								{{ element.type === 'text' ? element.text : '' }}
							</span>
							<span
								v-else-if="element.type === 'button'"
								:key="`button-${i}`"
								:class="element.type"
								:contenteditable="false"
								:data-index="i"
							>
								<button @click="removeField(i)">{{ element.text }}</button>
							</span>
						</template>
					</span>
					<span v-if="placeholder && !modelValue" class="placeholder">{{ placeholder }}</span>
				</template>

				<template #append>
					<v-icon name="add_box" outline clickable :disabled="disabled" @click="toggle" />
				</template>
			</v-input>
		</template>

		<v-list v-if="!disabled" :mandatory="false" @toggle="loadFieldRelations($event.value)">
			<field-list-item v-for="field in treeList" :key="field.field" :field="field" :depth="depth" @add="addField" />
		</v-list>
	</v-menu>
	<v-input :slug="true" placeholder="hello"></v-input>
</template>

<script lang="ts">
import { defineComponent, toRefs, ref, nextTick, PropType } from 'vue';
import FieldListItem from './field-list-item.vue';
import { FieldTree } from './types';
import { Field, Relation } from '@directus/shared/types';
import { useFieldTree } from '@/composables/use-field-tree';

type EditorNode =
	| { type: 'text'; text: string }
	| { type: 'button'; text: string; meta?: Record<string, unknown> }
	| { type: 'empty' };

export default defineComponent({
	components: { FieldListItem },
	props: {
		disabled: {
			type: Boolean,
			default: false,
		},
		modelValue: {
			type: String,
			default: null,
		},
		nullable: {
			type: Boolean,
			default: true,
		},
		collection: {
			type: String,
			default: null,
		},
		depth: {
			type: Number,
			default: undefined,
		},
		placeholder: {
			type: String,
			default: null,
		},
		inject: {
			type: Object as PropType<{ fields: Field[]; relations: Relation[] }>,
			default: null,
		},
	},
	emits: ['update:modelValue'],
	setup(props, { emit }) {
		const contentEl = ref<HTMLElement | null>(null);

		const menuActive = ref(false);

		const { collection, inject } = toRefs(props);
		const { treeList, loadFieldRelations } = useFieldTree(collection, inject);

		const localValue = ref<EditorNode[]>([{ type: 'empty' }]);

		// watch(() => props.modelValue, setContent, { immediate: true });

		return {
			contentEl,
			menuActive,
			localValue,
			treeList,
			onInput,
			onKeyDown,
			addField,
			removeField,
			loadFieldRelations,
		};

		function onInput() {
			const selection = getSelection();

			if (!selection || !contentEl.value) return;

			const index = selection.startIndex;
			const text = contentEl.value.children.item(index)?.textContent?.replace(/\u00a0/g, ' ');

			if (!text) return;

			localValue.value[index] = { type: 'text', text };
		}

		async function onKeyDown(event: KeyboardEvent) {
			if (event.key === '{' || event.key === '}') {
				event.preventDefault();
				menuActive.value = true;
			} else if (event.key === 'Enter') {
				event.preventDefault();
			} else if (event.key === 'Backspace') {
				const selection = getSelection();

				if (!selection) return;

				const index = selection.startIndex;
				const offset = selection.startOffset;
				const node = localValue.value[index];
				const length = node.type === 'text' ? node.text.length : 0;

				if (length === 1 && offset === 1) {
					event.preventDefault();

					localValue.value[index] = { type: 'empty' };
				} else if (offset === 0) {
					event.preventDefault();

					const prev = localValue.value[index - 1];

					if (index > 0 && prev.type === 'button') {
						await removeField(index - 1);
					}
				}
			} else if (event.key === 'Delete') {
				const selection = getSelection();

				if (!selection) return;

				const index = selection.startIndex;
				const offset = selection.startOffset;
				const node = localValue.value[index];
				const length = node.type === 'text' ? node.text.length : 0;

				if (length === 1 && offset === 0) {
					event.preventDefault();

					localValue.value[index] = { type: 'empty' };
				} else if (offset === length) {
					event.preventDefault();

					const next = localValue.value[index + 1];

					if (index < localValue.value.length - 1 && next.type === 'button') {
						await removeField(index + 1);
					}
				}
			}
		}

		async function addField(field: FieldTree) {
			const selection = getSelection();

			if (!selection) return;

			const index = selection.startIndex;
			const offset = selection.startOffset;
			const node = localValue.value[index];

			if (node.type === 'text') {
				const length = node.text.length;

				localValue.value.splice(
					index,
					1,
					offset === 0 ? { type: 'empty' } : { type: 'text', text: node.text.substring(0, offset) },
					{ type: 'button', text: field.name, meta: { key: field.key } },
					offset === length ? { type: 'empty' } : { type: 'text', text: node.text.substring(offset, length) }
				);
			} else if (node.type === 'empty') {
				localValue.value.splice(
					index,
					0,
					{ type: 'empty' },
					{ type: 'button', text: field.name, meta: { key: field.key } }
				);
			}

			await nextTick();
			setSelection({ startIndex: index + 2 });
		}

		async function removeField(index: number) {
			const prev = localValue.value[index - 1];
			const next = localValue.value[index + 1];

			const offset = prev.type === 'text' ? prev.text.length : 0;

			if (prev.type === 'text' && next.type === 'text') {
				prev.text += next.text;

				localValue.value.splice(index, 2);
			} else if (prev.type === 'empty') {
				localValue.value.splice(index - 1, 2);
			} else if (next.type === 'empty') {
				localValue.value.splice(index, 2);
			}

			await nextTick();
			setSelection({ startIndex: index - 1, startOffset: offset });
		}

		function findTree(tree: FieldTree[] | undefined, fieldSections: string[]): FieldTree | undefined {
			if (tree === undefined) return undefined;

			const fieldObject = tree.find((f) => f.field === fieldSections[0]);

			if (fieldObject === undefined) return undefined;
			if (fieldSections.length === 1) return fieldObject;
			return findTree(fieldObject.children, fieldSections.slice(1));
		}

		function getInputValue() {
			if (!contentEl.value) return null;

			const value = Array.from(contentEl.value.childNodes).reduce((acc, node) => {
				const el = node as HTMLElement;
				const tag = el.tagName;

				if (tag && tag.toLowerCase() === 'button') return (acc += `{{${el.dataset.field}}}`);
				else if ('textContent' in el) return (acc += el.textContent);

				return (acc += '');
			}, '');

			if (props.nullable === true && value === '') {
				return null;
			}

			return value;
		}

		function setContent() {
			if (!contentEl.value) return;

			if (props.modelValue === null || props.modelValue === '') {
				contentEl.value.innerHTML = '<span class="text"></span>';
				return;
			}

			if (props.modelValue !== getInputValue()) {
				const regex = /({{.*?}})/g;

				const newInnerHTML = props.modelValue
					.split(regex)
					.map((part) => {
						if (part.startsWith('{{') === false) {
							return `<span class="text">${part}</span>`;
						}
						const fieldKey = part.replace(/({|})/g, '').trim();
						const fieldPath = fieldKey.split('.');

						for (let i = 0; i < fieldPath.length; i++) {
							loadFieldRelations(fieldPath.slice(0, i).join('.'));
						}

						const field = findTree(treeList.value, fieldPath);

						if (!field) return '';

						return `<button contenteditable="false" data-field="${fieldKey}" ${props.disabled ? 'disabled' : ''}>${
							field.name
						}</button>`;
					})
					.join('');
				contentEl.value.innerHTML = newInnerHTML;
			}
		}

		function getSelection() {
			const selection = window.getSelection();

			if (!selection || selection.rangeCount === 0) return null;

			const range = selection.getRangeAt(0);

			if (!range) return null;

			const startIndex =
				range.startContainer instanceof HTMLElement
					? range.startContainer.dataset.index
					: range.startContainer.parentElement?.dataset.index;
			const endIndex =
				range.endContainer instanceof HTMLElement
					? range.endContainer.dataset.index
					: range.endContainer.parentElement?.dataset.index;

			if (startIndex === undefined || endIndex === undefined) return null;

			return {
				startIndex: Number(startIndex),
				startOffset: range.startOffset,
				endIndex: Number(endIndex),
				endOffset: range.endOffset,
			};
		}

		function setSelection({
			startIndex,
			startOffset = 0,
			endIndex = startIndex,
			endOffset = startOffset,
		}: {
			startIndex: number;
			startOffset?: number;
			endIndex?: number;
			endOffset?: number;
		}) {
			const selection = window.getSelection();

			if (!selection || !contentEl.value) return;

			selection.removeAllRanges();

			const startNode = contentEl.value.children.item(startIndex);
			const start = startNode?.classList.contains('empty') ? startNode : startNode?.childNodes.item(0);
			const endNode = contentEl.value.children.item(endIndex);
			const end = endNode?.classList.contains('empty') ? endNode : endNode?.childNodes.item(0);

			if (!start || !end) return;

			const range = document.createRange();
			range.setStart(start, startOffset);
			range.setEnd(end, endOffset);

			selection.addRange(range);
		}
	},
});
</script>

<style scoped>
.content {
	display: block;
	flex-grow: 1;
	height: 100%;
	padding: var(--input-padding) 0;
	overflow: hidden;
	font-family: var(--family-monospace);
	white-space: pre;
}

.content > :deep(span) {
	display: inline-block;
}

.content > :deep(.empty) {
	width: 1px;
}

.content > :deep(.empty:before) {
	content: '\2060';
}

.content :deep(button) {
	padding: 0 4px;
	color: var(--primary);
	background-color: var(--primary-alt);
	border-radius: var(--border-radius);
	transition: var(--fast) var(--transition);
	transition-property: background-color, color;
	user-select: none;
}

.content :deep(button:not(:disabled):hover) {
	color: var(--white);
	background-color: var(--danger);
}

.placeholder {
	position: absolute;
	top: 50%;
	left: var(--input-padding);
	color: var(--foreground-subdued);
	transform: translateY(-50%);
	user-select: none;
	pointer-events: none;
}
</style>
