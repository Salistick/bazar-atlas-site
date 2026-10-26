/* Searchable multi-select controls backed by the filter form's native selects. */
(() => {
  'use strict';
  const pickers = new Map();
  const textInputs = new WeakSet();
  const fold = value => String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  let activePicker = null;
  let eventsBound = false;

  const button = (label, className) => {
    const result = document.createElement('button');
    result.type = 'button'; result.className = className; result.setAttribute('aria-label', label);
    return result;
  };
  function signal(select) {
    select.dispatchEvent(new Event('change', {bubbles:true}));
  }
  function close(picker) {
    if (!picker) return;
    picker.open = false; picker.activeIndex = -1;
    picker.list.hidden = true;
    picker.input.setAttribute('aria-expanded', 'false');
    picker.input.removeAttribute('aria-activedescendant');
    picker.root.classList.remove('is-open');
    if (activePicker === picker) activePicker = null;
  }
  function open(picker) {
    if (picker.select.disabled) return;
    if (activePicker && activePicker !== picker) close(activePicker);
    activePicker = picker; picker.open = true;
    picker.list.hidden = false;
    picker.root.classList.add('is-open');
    picker.input.setAttribute('aria-expanded', 'true');
    renderOptions(picker);
  }
  function focusInput(picker) {
    picker.suppressFocus = true;
    picker.input.focus();
    picker.suppressFocus = false;
  }
  function available(picker) {
    const query = fold(picker.input.value);
    return [...picker.select.options].filter(option => option.value && !option.selected && !option.hidden &&
      (!query || fold(option.label || option.textContent || option.value).includes(query)));
  }
  function highlight(picker, index) {
    const options = [...picker.list.querySelectorAll('[role="option"]')];
    picker.activeIndex = index;
    options.forEach((element, number) => {
      const active = number === index;
      element.classList.toggle('is-highlighted', active);
      if (active) picker.input.setAttribute('aria-activedescendant', element.id);
    });
    if (index < 0) picker.input.removeAttribute('aria-activedescendant');
    const selected = options[index];
    if (selected && typeof selected.scrollIntoView === 'function') selected.scrollIntoView({block:'nearest'});
  }
  function choose(picker, option) {
    if (!option || option.disabled || option.selected || picker.select.disabled) return;
    option.selected = true;
    picker.input.value = '';
    refreshPicker(picker);
    close(picker);
    focusInput(picker);
    signal(picker.select);
  }
  function renderOptions(picker) {
    picker.options = available(picker);
    picker.list.replaceChildren();
    picker.options.forEach((option, number) => {
      const item = document.createElement('div');
      item.className = 'filter-combobox-option'; item.id = picker.select.id + '-option-' + number;
      item.setAttribute('role', 'option'); item.setAttribute('aria-selected', 'false');
      item.setAttribute('aria-disabled', String(option.disabled));
      item.dataset.value = option.value;
      if (option.dataset.image) {
        const icon = document.createElement('img'); icon.src = option.dataset.image; icon.alt = ''; item.append(icon);
      }
      const text = document.createElement('span'); text.textContent = option.label || option.textContent || option.value; item.append(text);
      item.addEventListener('mousedown', event => event.preventDefault());
      item.addEventListener('click', event => {event.stopPropagation(); choose(picker, option);});
      item.addEventListener('mousemove', () => {if (!option.disabled) highlight(picker, number);});
      picker.list.append(item);
    });
    if (!picker.options.length) {
      const empty = document.createElement('div'); empty.className = 'filter-combobox-empty';
      empty.setAttribute('role', 'status'); empty.textContent = picker.input.value ? 'No matching options' : 'No options available';
      picker.list.append(empty);
    }
    picker.activeIndex = -1; picker.input.removeAttribute('aria-activedescendant');
    picker.clear.disabled = !picker.input.value || picker.select.disabled;
    picker.clear.setAttribute('aria-hidden', String(!picker.input.value));
    picker.clear.tabIndex = picker.input.value ? 0 : -1;
  }
  function refreshPicker(picker) {
    const disabled = picker.select.disabled;
    picker.input.disabled = disabled;
    picker.input.placeholder = picker.select.dataset.placeholder || 'Select options';
    picker.root.classList.toggle('is-disabled', disabled);
    picker.chips.replaceChildren();
    [...picker.select.selectedOptions].filter(option => option.value).forEach(option => {
      const label = option.label || option.textContent || option.value;
      const chip = button('Remove ' + label, 'filter-selection-chip');
      chip.dataset.filterPickerRemove = option.value;
      const text = document.createElement('span'); text.textContent = label;
      const remove = document.createElement('span'); remove.className = 'filter-chip-remove'; remove.textContent = '×'; remove.setAttribute('aria-hidden', 'true');
      chip.append(text, remove);
      chip.addEventListener('click', event => {
        event.preventDefault(); event.stopPropagation();
        option.selected = false; refreshPicker(picker); close(picker); signal(picker.select); focusInput(picker);
      });
      picker.chips.append(chip);
    });
    picker.chips.hidden = !picker.chips.childElementCount;
    renderOptions(picker);
    if (disabled) close(picker);
  }
  function mountPicker(select) {
    if (pickers.has(select.id)) {refreshPicker(pickers.get(select.id)); return;}
    select.multiple = true; select.hidden = true;
    const root = document.createElement('div'); root.className = 'filter-multiselect'; root.dataset.filterComboboxFor = select.id;
    root.style.setProperty('--filter-control-width', (Number(select.dataset.width) || 200) + 'px');
    const control = document.createElement('div'); control.className = 'filter-combobox-control';
    const input = document.createElement('input'); input.type = 'text'; input.id = select.id + '-combobox';
    input.dataset.filterSearch = select.id; input.autocomplete = 'off'; input.spellcheck = false;
    input.setAttribute('role', 'combobox'); input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-haspopup', 'listbox'); input.setAttribute('aria-expanded', 'false');
    input.setAttribute('aria-controls', select.id + '-listbox'); input.setAttribute('aria-label', select.dataset.label || select.getAttribute('aria-label') || select.id);
    const clear = button('Clear search', 'filter-input-clear'); clear.textContent = '×';
    const list = document.createElement('div'); list.className = 'filter-combobox-list'; list.hidden = true;
    list.id = select.id + '-listbox'; list.setAttribute('role', 'listbox'); list.setAttribute('aria-label', (select.dataset.label || 'Filter') + ' options'); list.setAttribute('aria-multiselectable', 'true');
    const chips = document.createElement('div'); chips.className = 'filter-selected-options';
    control.append(input, clear); root.append(control, list, chips); select.after(root);
    const picker = {select, root, input, clear, list, chips, open:false, options:[], activeIndex:-1, suppressFocus:false};
    pickers.set(select.id, picker);
    input.addEventListener('focus', () => {if (!picker.suppressFocus) open(picker);});
    input.addEventListener('click', () => open(picker));
    input.addEventListener('input', event => {event.stopPropagation(); open(picker);});
    input.addEventListener('change', event => event.stopPropagation());
    input.addEventListener('keydown', event => {
      if (event.key === 'Escape' && picker.open) {
        event.preventDefault(); event.stopPropagation(); close(picker); return;
      }
      if (event.key === 'Tab') {close(picker); return;}
      if (['ArrowDown','ArrowUp'].includes(event.key)) {
        event.preventDefault(); event.stopPropagation();
        if (!picker.open) open(picker);
        const enabled = picker.options.map((option,index)=>option.disabled?-1:index).filter(index=>index>=0);
        if (!enabled.length) return;
        let index = enabled.indexOf(picker.activeIndex);
        index = event.key === 'ArrowDown' ? (index+1)%enabled.length : (index<=0?enabled.length:index)-1;
        highlight(picker, enabled[index]);
      } else if (event.key === 'Enter' && picker.open) {
        event.preventDefault(); event.stopPropagation(); choose(picker, picker.options[picker.activeIndex]);
      }
    });
    clear.addEventListener('mousedown', event => event.preventDefault());
    clear.addEventListener('click', event => {event.preventDefault();event.stopPropagation();input.value='';open(picker);focusInput(picker);});
    select.addEventListener('change', () => refreshPicker(picker));
    const observer = new MutationObserver(() => {
      if (!select.isConnected) {observer.disconnect(); return;}
      refreshPicker(picker);
    });
    observer.observe(select, {childList:true,subtree:true,attributes:true,attributeFilter:['disabled','label','hidden']});
    picker.observer = observer;
    refreshPicker(picker);
  }
  function mountTextClear(input) {
    if (textInputs.has(input) || input.dataset.filterSearch || input.dataset.cosmeticFilter || input.type === 'number') return;
    textInputs.add(input);
    const control = document.createElement('span'); control.className = 'filter-text-control';
    if (input.dataset.cosmeticSearch) control.style.setProperty('--filter-control-width', '180px');
    const clear = button('Clear ' + (input.getAttribute('aria-label') || input.placeholder || 'input'), 'filter-input-clear'); clear.textContent = '×';
    input.before(control); control.append(input,clear);
    const update = () => {clear.disabled=!input.value;clear.tabIndex=input.value?0:-1;clear.setAttribute('aria-hidden',String(!input.value));};
    input.addEventListener('input',update); input.addEventListener('change',update);
    clear.addEventListener('mousedown',event=>event.preventDefault());
    clear.addEventListener('click', event => {event.preventDefault();event.stopPropagation();input.value='';update();input.focus();input.dispatchEvent(new Event('input',{bubbles:true}));});
    input._refreshFilterClear = update; update();
  }
  function refresh(id) {
    if (id) {
      const picker = pickers.get(typeof id === 'string' ? id : id.id); if (picker) refreshPicker(picker);
    } else {
      pickers.forEach(refreshPicker);
      document.querySelectorAll('#auctionFilterDrawer input').forEach(input=>input._refreshFilterClear?.());
    }
  }
  function setOptions(id, entries) {
    const select = typeof id === 'string' ? document.getElementById(id) : id;
    if (!select) return;
    const selected = new Set([...select.selectedOptions].map(option=>option.value));
    const options = entries.map(entry => {
      if (typeof entry === 'string') entry={value:entry,label:entry};
      const option = document.createElement('option'); option.value=String(entry.value); option.textContent=entry.label || entry.value;
      option.selected=selected.has(option.value); option.disabled=Boolean(entry.disabled); if(entry.image)option.dataset.image=entry.image;
      return option;
    });
    select.replaceChildren(...options); refresh(select.id);
  }
  function mount() {
    const drawer = document.getElementById('auctionFilterDrawer'); if (!drawer) return;
    drawer.querySelectorAll('select[data-filter-multi]').forEach(mountPicker);
    drawer.querySelectorAll('input:not([type]),input[type="text"]').forEach(mountTextClear);
    drawer.querySelectorAll('[data-filter-group],[data-skill-choice],[data-misc-filter],[data-cosmetic-choice],#filterAllImbuements,#filterAllItems').forEach(input=>input.setAttribute('role','switch'));
    if (!eventsBound) {
      eventsBound=true;
      document.addEventListener('pointerdown', event => {if(activePicker&&!activePicker.root.contains(event.target))close(activePicker);});
      document.addEventListener('focusin', event => {if(activePicker&&!activePicker.root.contains(event.target))close(activePicker);});
      document.addEventListener('keydown', event => {
        if(event.key!=='Tab'||drawer.hidden||!drawer.contains(document.activeElement))return;
        const nodes=[...drawer.querySelectorAll('button,input,select,a[href],summary,[tabindex="0"]')].filter(element=>!element.disabled&&element.tabIndex>=0&&!element.closest('[hidden]')&&getComputedStyle(element).display!=='none'&&(!element.closest('details:not([open])')||element.tagName==='SUMMARY'));
        if(!nodes.length)return;
        if(event.shiftKey&&document.activeElement===nodes[0]){event.preventDefault();nodes.at(-1).focus();}
        else if(!event.shiftKey&&document.activeElement===nodes.at(-1)){event.preventDefault();nodes[0].focus();}
      });
    }
    refresh();
  }
  window.BazaarFilterControls = Object.freeze({mount, refresh, setOptions});
})();
